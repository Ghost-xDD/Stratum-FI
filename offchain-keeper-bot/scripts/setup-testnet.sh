#!/bin/bash
# Setup script for testnet deployment
# Checks prerequisites and guides through keeper authorization

set -e

echo "🚀 Stratum Fi Keeper Bot - Testnet Setup"
echo "=========================================="
echo ""

# Check Python version
echo "Checking Python version..."
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "✅ Python $python_version"

# Check if .env exists
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ Created .env"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and add your KEEPER_PRIVATE_KEY"
    echo "   nano .env"
    echo ""
    read -p "Press Enter after you've configured .env..."
fi

# Load environment
set -a
source .env
set +a

# Check keeper private key
if [ "$KEEPER_PRIVATE_KEY" = "0x..." ]; then
    echo "❌ Error: KEEPER_PRIVATE_KEY not set in .env"
    exit 1
fi

# Derive keeper address (requires web3.py)
echo ""
echo "Deriving keeper address from private key..."
keeper_address=$(python3 -c "
from eth_account import Account
import os
account = Account.from_key(os.getenv('KEEPER_PRIVATE_KEY'))
print(account.address)
" 2>/dev/null || echo "FAILED")

if [ "$keeper_address" = "FAILED" ]; then
    echo "❌ Error: Invalid private key or web3 not installed"
    echo "   Run: pip install web3"
    exit 1
fi

echo "✅ Keeper Address: $keeper_address"

# Check if keeper is authorized
echo ""
echo "Checking keeper authorization on-chain..."
is_authorized=$(python3 -c "
from web3 import Web3
import json
import os
from pathlib import Path

rpc_url = os.getenv('RPC_URL')
w3 = Web3(Web3.HTTPProvider(rpc_url))

harvester_address = os.getenv('HARVESTER_ADDRESS')
abi_path = Path(__file__).parent.parent / 'frontend/stratum-fi/abi/Harvester.json'

if not abi_path.exists():
    print('ABI_NOT_FOUND')
    exit(0)

with open(abi_path) as f:
    abi = json.load(f)['abi']

harvester = w3.eth.contract(address=Web3.to_checksum_address(harvester_address), abi=abi)
authorized_keeper = harvester.functions.keeper().call()

if authorized_keeper.lower() == '$keeper_address'.lower():
    print('AUTHORIZED')
else:
    print(f'NOT_AUTHORIZED:{authorized_keeper}')
" 2>/dev/null || echo "CHECK_FAILED")

if [ "$is_authorized" = "AUTHORIZED" ]; then
    echo "✅ Keeper is already authorized in Harvester contract!"
elif [[ "$is_authorized" == NOT_AUTHORIZED:* ]]; then
    current_keeper=${is_authorized#NOT_AUTHORIZED:}
    echo "⚠️  Keeper NOT authorized!"
    echo "   Current authorized keeper: $current_keeper"
    echo "   Your keeper address:       $keeper_address"
    echo ""
    echo "To authorize your keeper:"
    echo "  1. Go to: ${EXPLORER_URL}/address/${HARVESTER_ADDRESS}#writeContract"
    echo "  2. Connect wallet (as contract owner)"
    echo "  3. Call setKeeper($keeper_address)"
    echo ""
    echo "Or run authorization script:"
    echo "  cd ../stratum-contracts"
    echo "  KEEPER_ADDRESS=$keeper_address npx hardhat run ../offchain-keeper-bot/scripts/authorize-keeper.ts --network mezoTestnet"
    echo ""
    read -p "Press Enter after authorizing the keeper..."
else
    echo "⚠️  Could not verify authorization (check RPC connection)"
fi

# Check keeper balance
echo ""
echo "Checking keeper wallet balance..."
balance=$(python3 -c "
from web3 import Web3
import os
w3 = Web3(Web3.HTTPProvider(os.getenv('RPC_URL')))
balance_wei = w3.eth.get_balance('$keeper_address')
balance_btc = float(w3.from_wei(balance_wei, 'ether'))
print(f'{balance_btc:.6f}')
" 2>/dev/null || echo "0")

echo "Keeper Balance: $balance BTC"

if (( $(echo "$balance < 0.001" | bc -l) )); then
    echo "⚠️  WARNING: Low keeper balance!"
    echo "   Recommended: At least 0.01 BTC for gas"
    echo "   Fund your keeper wallet: $keeper_address"
    echo ""
fi

# Final check
echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "To start the keeper bot:"
echo "  make run"
echo ""
echo "Or with Docker:"
echo "  make docker-up"
echo ""
echo "Monitor at:"
echo "  - Health:     http://localhost:8080/health"
echo "  - Metrics:    http://localhost:8000/metrics"
echo "  - Prometheus: http://localhost:9090 (if using Docker)"
echo ""
echo "Happy harvesting! 🌾"

