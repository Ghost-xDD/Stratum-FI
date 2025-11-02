import { ethers } from 'hardhat';
import * as deployedAddresses from '../../ignition/deployments/chain-31611/deployed_addresses.json';

/**
 * Borrow bMUSD against your collateral
 */
async function main() {
  const [user] = await ethers.getSigners();
  console.log('User address:', user.address);

  // Load contracts
  const debtManagerAddress =
    deployedAddresses['StratumFiFinal#DebtManager'] ||
    deployedAddresses['StratumFi#DebtManager'];
  const bmusdAddress =
    deployedAddresses['StratumFiFinal#bMUSD'] ||
    deployedAddresses['StratumFi#bMUSD'];

  const debtManager = await ethers.getContractAt(
    'DebtManager',
    debtManagerAddress
  );
  const bmusd = await ethers.getContractAt('bMUSD', bmusdAddress);

  // Check borrowing capacity
  console.log('\n📊 Checking borrowing capacity...');
  const [maxBorrow, currentDebt, available] =
    await debtManager.getBorrowingCapacity(user.address);

  console.log('Max borrow:', ethers.formatEther(maxBorrow), 'bMUSD');
  console.log('Current debt:', ethers.formatEther(currentDebt), 'bMUSD');
  console.log('Available:', ethers.formatEther(available), 'bMUSD');

  if (available === 0n) {
    console.error('❌ No borrowing capacity. Deposit BTC first!');
    return;
  }

  // Borrow specific amount (500 bMUSD)
  const borrowAmount = ethers.parseEther('500');

  // Check if we have enough capacity
  if (borrowAmount > available) {
    console.error('❌ Not enough borrowing capacity!');
    console.log('   Requested:', ethers.formatEther(borrowAmount), 'bMUSD');
    console.log('   Available:', ethers.formatEther(available), 'bMUSD');
    console.log('   Need to deposit more BTC to increase capacity');
    return;
  }

  console.log('\n💸 Borrowing:', ethers.formatEther(borrowAmount), 'bMUSD');

  const borrowTx = await debtManager.borrow(borrowAmount);
  await borrowTx.wait();
  console.log('✅ Borrowed successfully');

  // Check balance
  const balance = await bmusd.balanceOf(user.address);
  console.log('\n💰 Your bMUSD balance:', ethers.formatEther(balance));

  // Check updated debt
  const newDebt = await debtManager.userDebt(user.address);
  console.log('Your debt:', ethers.formatEther(newDebt), 'bMUSD');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
