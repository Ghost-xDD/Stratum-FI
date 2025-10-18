import { ethers } from 'hardhat';

async function main() {
  const [user] = await ethers.getSigners();

  const routerAddress = '0x9a1ff7FE3a0F69959A3fBa1F1e5ee18e1A9CD7E9';
  const btcAddress = '0x7b7C000000000000000000000000000000000000';
  const mcbbtcAddress = '0x2278CAAE0009E8a325a346feA573eF23C5756DbF';

  const router = await ethers.getContractAt('ITigrisRouter', routerAddress);
  const btc = await ethers.getContractAt('IERC20', btcAddress);
  const mcbbtc = await ethers.getContractAt('IERC20', mcbbtcAddress);

  console.log('\n🔄 Testing BTC → mcbBTC Swap\n');

  const btcBalance = await btc.balanceOf(user.address);
  console.log('Your BTC balance:', ethers.formatEther(btcBalance));

  const swapAmount = ethers.parseEther('0.0001'); // Small test amount
  console.log('Swapping:', ethers.formatEther(swapAmount), 'BTC → mcbBTC');

  // Approve
  console.log('\n1️⃣ Approving BTC...');
  const approveTx = await btc.approve(routerAddress, swapAmount);
  await approveTx.wait();
  console.log('✅ Approved');

  // Try swap
  console.log('\n2️⃣ Attempting swap...');
  try {
    const path = [btcAddress, mcbbtcAddress];
    const tx = await router.swapExactTokensForTokens(
      swapAmount,
      0,
      path,
      user.address,
      Math.floor(Date.now() / 1000) + 600
    );
    await tx.wait();
    console.log('✅ SUCCESS! BTC → mcbBTC swap works!');

    const mcbbtcReceived = await mcbbtc.balanceOf(user.address);
    console.log('\nmcbBTC received:', ethers.formatEther(mcbbtcReceived));

    console.log('\n🎉 THIS MEANS:');
    console.log('✅ We can use mcbBTC/BTC pool for TurboLoop!');
    console.log('✅ Flow: bMUSD → MUSD → BTC → (half to mcbBTC) → LP');
  } catch (e: any) {
    console.log('❌ BTC → mcbBTC swap failed');
    console.log('Error:', e.message);

    console.log('\n💡 Alternative: Try reverse swap (mcbBTC → BTC)');
    // This would mean we need users to already have mcbBTC
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
