/**
 * Authorize Keeper Wallet in Harvester Contract
 * Run this script before starting the keeper bot
 *
 * Usage:
 *   cd ../../stratum-contracts
 *   npx hardhat run ../offchain-keeper-bot/scripts/authorize-keeper.ts --network mezoTestnet
 */

import { ethers } from 'hardhat';

async function main() {
  const harvesterAddress = '0x5A296604269470c24290e383C2D34F41B2B375c0';

  // Get keeper address from environment or prompt
  const keeperAddress =
    process.env.KEEPER_ADDRESS || 'YOUR_KEEPER_WALLET_ADDRESS';

  if (keeperAddress === 'YOUR_KEEPER_WALLET_ADDRESS') {
    console.error('❌ Error: Please set KEEPER_ADDRESS environment variable');
    console.error(
      'Example: KEEPER_ADDRESS=0xYourKeeperAddress npx hardhat run ...'
    );
    process.exit(1);
  }

  console.log('🔐 Authorizing Keeper Wallet in Harvester Contract');
  console.log('='.repeat(60));
  console.log(`Harvester: ${harvesterAddress}`);
  console.log(`Keeper:    ${keeperAddress}`);
  console.log('='.repeat(60));

  // Get signer (must be contract owner)
  const [signer] = await ethers.getSigners();
  console.log(`Signer:    ${signer.address}`);

  // Get Harvester contract
  const harvester = await ethers.getContractAt('Harvester', harvesterAddress);

  // Check current keeper
  const currentKeeper = await harvester.keeper();
  console.log(`\nCurrent authorized keeper: ${currentKeeper}`);

  if (currentKeeper.toLowerCase() === keeperAddress.toLowerCase()) {
    console.log('✅ Keeper is already authorized!');
    return;
  }

  // Set new keeper
  console.log('\n📝 Setting new keeper address...');
  const tx = await harvester.setKeeper(keeperAddress);
  console.log(`Transaction sent: ${tx.hash}`);

  // Wait for confirmation
  console.log('⏳ Waiting for confirmation...');
  const receipt = await tx.wait();

  if (receipt.status === 1) {
    console.log('✅ Keeper authorized successfully!');

    // Verify
    const newKeeper = await harvester.keeper();
    console.log(`\nVerified keeper: ${newKeeper}`);
    console.log(
      `Match: ${
        newKeeper.toLowerCase() === keeperAddress.toLowerCase() ? '✅' : '❌'
      }`
    );

    console.log(
      '\n🎉 Authorization complete! You can now start the keeper bot.'
    );
  } else {
    console.log('❌ Transaction failed!');
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
