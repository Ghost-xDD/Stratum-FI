import { ethers } from 'hardhat';

async function main() {
  const [user] = await ethers.getSigners();

  const routerAddress = '0x9a1ff7FE3a0F69959A3fBa1F1e5ee18e1A9CD7E9';
  const btcAddress = '0x7b7C000000000000000000000000000000000000';
  const musdAddress = '0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503';
  const mcbbtcAddress = '0x2278CAAE0009E8a325a346feA573eF23C5756DbF';

  const router = await ethers.getContractAt('ITigrisRouter', routerAddress);
  const btc = await ethers.getContractAt('IERC20', btcAddress);

  console.log('\n🔄 Testing Multi-Hop Swaps to mcbBTC\n');

  const swapAmount = ethers.parseEther('0.0001');

  // Test 1: BTC → MUSD → mcbBTC
  console.log('1️⃣ Testing: BTC → MUSD → mcbBTC');
  try {
    const approveTx = await btc.approve(routerAddress, swapAmount);
    await approveTx.wait();

    const path = [btcAddress, musdAddress, mcbbtcAddress];
    const tx = await router.swapExactTokensForTokens(
      swapAmount,
      0,
      path,
      user.address,
      Math.floor(Date.now() / 1000) + 600
    );
    await tx.wait();
    console.log('✅ Multi-hop worked!');
  } catch (e: any) {
    console.log('❌ Failed:', e.message.split('\n')[0]);
  }

  // Test 2: Check if there's a MUSD → mcbBTC direct pool
  console.log('\n2️⃣ Testing: MUSD → mcbBTC (direct)');
  const musd = await ethers.getContractAt('IERC20', musdAddress);
  const musdBalance = await musd.balanceOf(user.address);

  if (musdBalance > 0n) {
    try {
      const testAmount = ethers.parseEther('1');
      const approveTx = await musd.approve(routerAddress, testAmount);
      await approveTx.wait();

      const path = [musdAddress, mcbbtcAddress];
      const tx = await router.swapExactTokensForTokens(
        testAmount,
        0,
        path,
        user.address,
        Math.floor(Date.now() / 1000) + 600
      );
      await tx.wait();
      console.log('✅ MUSD → mcbBTC direct swap works!');
    } catch (e: any) {
      console.log('❌ No direct MUSD/mcbBTC pool');
    }
  }

  console.log('\n💡 CONCLUSION:');
  console.log('If no path to mcbBTC exists, we should:');
  console.log(
    '  Option A: Just add all MUSD to MUSD/BTC pool (same as primary)'
  );
  console.log(
    '  Option B: Use try-catch fallback (keep MUSD or return to user)'
  );
  console.log('  Option C: Keep MUSD and let user do what they want with it');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
