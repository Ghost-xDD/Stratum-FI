import { ethers } from 'hardhat';
import * as deployedAddresses from '../ignition/deployments/chain-31611/deployed_addresses.json';

async function main() {
  const [user] = await ethers.getSigners();
  
  const debtManager = await ethers.getContractAt(
    'DebtManager',
    deployedAddresses['StratumFi#DebtManager']
  );
  
  const strategy = await ethers.getContractAt(
    'StrategyBTC',
    deployedAddresses['StratumFi#StrategyBTC']
  );
  
  console.log('\n🔍 DEBUGGING BORROW ISSUE\n');
  
  // Check strategy setup
  const strategyInDebt = await debtManager.strategy();
  console.log('Strategy in DebtManager:', strategyInDebt);
  console.log('Actual Strategy:', deployedAddresses['StratumFi#StrategyBTC']);
  console.log('Match:', strategyInDebt === deployedAddresses['StratumFi#StrategyBTC']);
  
  // Check user collateral in strategy
  const userCollateral = await strategy.balanceOf(user.address);
  console.log('\nUser collateral in strategy:', ethers.formatEther(userCollateral), 'BTC');
  
  // Check oracle
  try {
    const pythOracle = await debtManager.pythOracle();
    const btcPriceFeedId = await debtManager.btcPriceFeedId();
    
    console.log('\nOracle:', pythOracle);
    console.log('Price Feed ID:', btcPriceFeedId);
    
    // Try to get price
    const pyth = await ethers.getContractAt('IPyth', pythOracle);
    const price = await pyth.getPriceUnsafe(btcPriceFeedId);
    
    console.log('\nBTC Price:');
    console.log('  Price:', price.price.toString());
    console.log('  Expo:', price.expo.toString());
    console.log('  Conf:', price.conf.toString());
    
  } catch (e: any) {
    console.log('\n❌ Oracle error:', e.message);
  }
  
  // Try getBorrowingCapacity
  try {
    const [maxBorrow, currentDebt, available] = await debtManager.getBorrowingCapacity(user.address);
    console.log('\nBorrowing Capacity:');
    console.log('  Max:', ethers.formatEther(maxBorrow));
    console.log('  Current:', ethers.formatEther(currentDebt));
    console.log('  Available:', ethers.formatEther(available));
  } catch (e: any) {
    console.log('\n❌ Capacity check error:', e.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

