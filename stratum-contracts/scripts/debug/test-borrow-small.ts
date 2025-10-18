import { ethers } from 'hardhat';
import * as deployedAddresses from '../ignition/deployments/chain-31611/deployed_addresses.json';

async function main() {
  const [user] = await ethers.getSigners();
  
  const debtManager = await ethers.getContractAt(
    'DebtManager',
    deployedAddresses['StratumFi#DebtManager']
  );
  
  console.log('\n💸 Testing Small Borrow\n');
  
  const [maxBorrow, currentDebt, available] = await debtManager.getBorrowingCapacity(user.address);
  console.log('Available:', ethers.formatEther(available), 'bMUSD');
  
  // Try borrowing just 1 bMUSD
  const borrowAmount = ethers.parseEther('1');
  console.log('Attempting to borrow:', ethers.formatEther(borrowAmount), 'bMUSD');
  
  try {
    const tx = await debtManager.borrow(borrowAmount);
    await tx.wait();
    console.log('✅ SUCCESS!');
    
    const debt = await debtManager.userDebt(user.address);
    console.log('Your debt:', ethers.formatEther(debt), 'bMUSD');
  } catch (error: any) {
    console.log('❌ FAILED');
    console.log('Error:', error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

