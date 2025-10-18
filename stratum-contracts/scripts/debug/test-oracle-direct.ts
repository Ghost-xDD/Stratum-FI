import { ethers } from 'hardhat';
import * as deployedAddresses from '../ignition/deployments/chain-31611/deployed_addresses.json';

async function main() {
  const debtManager = await ethers.getContractAt(
    'DebtManager',
    deployedAddresses['StratumFi#DebtManager']
  );
  
  const pythAddress = await debtManager.pythOracle();
  const priceFeedId = await debtManager.btcPriceFeedId();
  
  console.log('\n🔮 TESTING PYTH ORACLE DIRECTLY\n');
  console.log('Oracle:', pythAddress);
  console.log('Feed ID:', priceFeedId);
  
  const pyth = await ethers.getContractAt('IPyth', pythAddress);
  
  // Test getPriceUnsafe
  console.log('\n1️⃣ Testing getPriceUnsafe:');
  try {
    const price = await pyth.getPriceUnsafe(priceFeedId);
    console.log('✅ Success!');
    console.log('   Price:', price.price.toString());
    console.log('   Expo:', price.expo.toString());
    console.log('   Publish time:', new Date(Number(price.publishTime) * 1000).toLocaleString());
  } catch (e: any) {
    console.log('❌ Failed:', e.message);
  }
  
  // Test getPriceNoOlderThan
  console.log('\n2️⃣ Testing getPriceNoOlderThan (300 seconds):');
  try {
    const price = await pyth.getPriceNoOlderThan(priceFeedId, 300);
    console.log('✅ Success!');
    console.log('   Price:', price.price.toString());
    console.log('   Publish time:', new Date(Number(price.publishTime) * 1000).toLocaleString());
  } catch (e: any) {
    console.log('❌ Failed:', e.message);
    console.log('This means price is too old OR function doesn\'t exist');
  }
  
  // Test with longer age
  console.log('\n3️⃣ Testing getPriceNoOlderThan (3600 seconds):');
  try {
    const price = await pyth.getPriceNoOlderThan(priceFeedId, 3600);
    console.log('✅ Success with 1 hour tolerance!');
  } catch (e: any) {
    console.log('❌ Still failed:', e.message);
  }
  
  console.log('\n💡 SOLUTION:');
  console.log('If getPriceNoOlderThan fails, we should use getPriceUnsafe');
  console.log('Or increase MAX_PRICE_AGE in DebtManager');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

