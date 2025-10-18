import { ethers } from 'hardhat';

async function main() {
  const [user] = await ethers.getSigners();

  const mcbbtcAddress = '0x2278CAAE0009E8a325a346feA573eF23C5756DbF';
  const btcAddress = '0x7b7C000000000000000000000000000000000000';

  const mcbbtc = await ethers.getContractAt('IERC20', mcbbtcAddress);
  const btc = await ethers.getContractAt('IERC20', btcAddress);

  console.log('\n💰 Token Balances for:', user.address);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const mcbbtcBalance = await mcbbtc.balanceOf(user.address);
  const btcBalance = await btc.balanceOf(user.address);

  console.log('\nmcbBTC:', ethers.formatEther(mcbbtcBalance));
  console.log('BTC:', ethers.formatEther(btcBalance));

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (mcbbtcBalance > 0n) {
    console.log('✅ You have mcbBTC! Can use mcbBTC/BTC pool');
  } else {
    console.log('❌ No mcbBTC balance');
    console.log('💡 You can:');
    console.log('   1. Wrap BTC → mcbBTC (if wrapper exists)');
    console.log('   2. Swap BTC → mcbBTC on Tigris');
    console.log('   3. Or just use BTC for single-sided liquidity');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
