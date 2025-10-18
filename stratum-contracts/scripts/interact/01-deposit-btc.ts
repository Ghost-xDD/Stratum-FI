import { ethers } from 'hardhat';
import * as deployedAddresses from '../../ignition/deployments/chain-31611/deployed_addresses.json';

/**
 * Deposit BTC into VaultController
 */
async function main() {
  const [user] = await ethers.getSigners();
  console.log('User address:', user.address);

  // Load contracts
  const vaultAddress = deployedAddresses['StratumFiFinal#VaultController'];
  const vaultController = await ethers.getContractAt(
    'VaultController',
    vaultAddress
  );

  const btcAddress = '0x7b7C000000000000000000000000000000000000';
  const btc = await ethers.getContractAt('IERC20', btcAddress);

  // Amount to deposit (0.0001 BTC = 10,000 sats)
  const depositAmount = ethers.parseEther('0.0001');

  console.log('\n📥 Depositing BTC...');
  console.log('Amount:', ethers.formatEther(depositAmount), 'BTC');

  // Check balance
  const balance = await btc.balanceOf(user.address);
  console.log('Your BTC balance:', ethers.formatEther(balance));

  if (balance < depositAmount) {
    console.error('❌ Insufficient BTC balance');
    return;
  }

  // Approve BTC
  console.log('\n1. Approving BTC...');
  const approveTx = await btc.approve(vaultController.target, depositAmount);
  await approveTx.wait();
  console.log('✅ Approved');

  // Deposit
  console.log('\n2. Depositing to vault...');
  const depositTx = await vaultController.deposit(depositAmount);
  await depositTx.wait();
  console.log('✅ Deposited');

  // Check deposit
  const userDeposit = await vaultController.balanceOf(user.address);
  console.log(
    '\n💰 Your total deposits:',
    ethers.formatEther(userDeposit),
    'BTC'
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
