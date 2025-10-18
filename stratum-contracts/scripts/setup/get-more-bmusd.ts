import { ethers } from 'hardhat';
import * as deployedAddresses from '../../ignition/deployments/chain-31611/deployed_addresses.json';

/**
 * Simple: Deposit 0.001 BTC and borrow max bMUSD
 */
async function main() {
  const [user] = await ethers.getSigners();

  const vaultAddress = deployedAddresses['StratumFiFinal#VaultController'];
  const debtManagerAddress = deployedAddresses['StratumFiFinal#DebtManager'];
  const btcAddress = '0x7b7C000000000000000000000000000000000000';

  const vaultController = await ethers.getContractAt(
    'VaultController',
    vaultAddress
  );
  const debtManager = await ethers.getContractAt(
    'DebtManager',
    debtManagerAddress
  );
  const btc = await ethers.getContractAt('IERC20', btcAddress);

  console.log('\n💰 Getting More bMUSD\n');

  // Deposit fixed amount
  const depositAmount = ethers.parseEther('0.001'); // 0.001 BTC ≈ $10.5 ≈ 5.25 bMUSD capacity

  console.log('1️⃣ Depositing', ethers.formatEther(depositAmount), 'BTC...');

  let tx = await btc.approve(vaultController.target, depositAmount);
  await tx.wait();
  tx = await vaultController.deposit(depositAmount);
  await tx.wait();
  console.log('✅ Deposited');

  // Check new capacity
  const [, , available] = await debtManager.getBorrowingCapacity(user.address);
  console.log(
    '\n2️⃣ New borrowing capacity:',
    ethers.formatEther(available),
    'bMUSD'
  );

  // Borrow 80% of available
  const borrowAmount = (available * 80n) / 100n;
  console.log('Borrowing:', ethers.formatEther(borrowAmount), 'bMUSD');

  tx = await debtManager.borrow(borrowAmount);
  await tx.wait();
  console.log('✅ Borrowed');

  // Check final balance
  const bmusd = await ethers.getContractAt(
    'IERC20',
    deployedAddresses['StratumFiFinal#bMUSD']
  );
  const bmusdBalance = await bmusd.balanceOf(user.address);
  console.log('\n💎 Your bMUSD balance:', ethers.formatEther(bmusdBalance));
  console.log('\n✅ Ready to add liquidity! Run: npm run add-liquidity');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
