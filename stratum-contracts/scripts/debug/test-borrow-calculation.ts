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
  
  console.log('\n🧮 TESTING BORROW CALCULATION\n');
  
  // Get oracle info
  const pythOracle = await debtManager.pythOracle();
  const btcPriceFeedId = await debtManager.btcPriceFeedId();
  const pyth = await ethers.getContractAt('IPyth', pythOracle);
  
  // Get price
  const btcPrice = await pyth.getPriceUnsafe(btcPriceFeedId);
  console.log('BTC Price from Pyth:');
  console.log('  price:', btcPrice.price.toString());
  console.log('  expo:', btcPrice.expo.toString());
  
  // Get collateral
  const collateralBTC = await strategy.balanceOf(user.address);
  console.log('\nCollateral BTC:', ethers.formatEther(collateralBTC));
  
  // Replicate the calculation
  const btcPriceUSD = BigInt(btcPrice.price.toString());
  const priceExponent = BigInt(-Number(btcPrice.expo));
  
  console.log('\nCalculation:');
  console.log('  btcPriceUSD:', btcPriceUSD.toString());
  console.log('  priceExponent:', priceExponent.toString());
  console.log('  10^expo:', (10n ** priceExponent).toString());
  
  const collateralValueUSD = (collateralBTC * btcPriceUSD) / (10n ** priceExponent);
  console.log('  collateralValueUSD:', ethers.formatEther(collateralValueUSD));
  
  const ltvRatio = await debtManager.ltvRatio();
  const maxBorrow = (collateralValueUSD * ltvRatio) / 10000n;
  console.log('  LTV ratio:', ltvRatio.toString(), 'bps');
  console.log('  maxBorrow:', ethers.formatEther(maxBorrow));
  
  // Now try to borrow
  console.log('\n💸 Attempting borrow of 1 bMUSD...');
  try {
    // Use staticCall to see revert reason
    await debtManager.borrow.staticCall(ethers.parseEther('1'));
    console.log('✅ Static call passed - actual tx should work!');
    
    const tx = await debtManager.borrow(ethers.parseEther('1'));
    await tx.wait();
    console.log('✅ Borrowed successfully!');
  } catch (error: any) {
    console.log('❌ Failed');
    console.log('Error:', error.message);
    
    // Try even smaller
    console.log('\n💸 Trying 0.1 bMUSD...');
    try {
      const tx = await debtManager.borrow(ethers.parseEther('0.1'));
      await tx.wait();
      console.log('✅ Smaller amount worked!');
    } catch (e: any) {
      console.log('❌ Still failed:', e.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

