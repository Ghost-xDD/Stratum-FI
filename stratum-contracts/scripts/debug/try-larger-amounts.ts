import { ethers } from 'hardhat';

async function main() {
  const [user] = await ethers.getSigners();

  const routerAddress = '0x9a1ff7FE3a0F69959A3fBa1F1e5ee18e1A9CD7E9';
  const btcAddress = '0x7b7C000000000000000000000000000000000000';
  const musdAddress = '0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503';

  const router = await ethers.getContractAt('ITigrisRouter', routerAddress);
  const btc = await ethers.getContractAt('IERC20', btcAddress);
  const musd = await ethers.getContractAt('IERC20', musdAddress);

  console.log('\n🧪 TESTING DIFFERENT AMOUNTS\n');

  // Check balances
  const btcBal = await btc.balanceOf(user.address);
  const musdBal = await musd.balanceOf(user.address);
  console.log('Available BTC:', ethers.formatEther(btcBal));
  console.log('Available MUSD:', ethers.formatEther(musdBal));

  // Pool reserves
  console.log('\nPool Reserves:');
  console.log('  MUSD: ~10,498,104');
  console.log('  BTC: ~1,002');

  // Test amounts (increasing sizes)
  const testAmounts = [
    { btc: '0.001', musd: '10' }, // $100 worth
    { btc: '0.01', musd: '100' }, // $1000 worth
    { btc: '0.1', musd: '1000' }, // $10k worth
  ];

  for (const amounts of testAmounts) {
    const btcAmount = ethers.parseEther(amounts.btc);
    const musdAmount = ethers.parseEther(amounts.musd);

    if (btcAmount > btcBal || musdAmount > musdBal) {
      console.log(`\n⏭️  Skipping ${amounts.btc} BTC (insufficient balance)`);
      continue;
    }

    console.log(`\n━━━ Testing ${amounts.btc} BTC + ${amounts.musd} MUSD ━━━`);

    try {
      // Approve
      const approveBtc = await btc.approve(routerAddress, btcAmount);
      await approveBtc.wait();
      const approveMusd = await musd.approve(routerAddress, musdAmount);
      await approveMusd.wait();

      // Try addLiquidity
      await router.addLiquidity.staticCall(
        btcAddress,
        musdAddress,
        btcAmount,
        musdAmount,
        (btcAmount * 95n) / 100n,
        (musdAmount * 95n) / 100n,
        user.address,
        Math.floor(Date.now() / 1000) + 300
      );

      console.log('✅ THIS AMOUNT WORKS! (simulation passed)');

      // Try actual transaction
      const tx = await router.addLiquidity(
        btcAddress,
        musdAddress,
        btcAmount,
        musdAmount,
        (btcAmount * 95n) / 100n,
        (musdAmount * 95n) / 100n,
        user.address,
        Math.floor(Date.now() / 1000) + 300
      );
      await tx.wait();
      console.log('✅✅ ACTUAL TRANSACTION SUCCEEDED!');
      break;
    } catch (error: any) {
      console.log('❌ Still fails at this amount');
      console.log('   Error:', error.message.split('\n')[0]);
    }
  }

  // Also test swap with larger amount
  console.log('\n━━━ Testing Swap with Larger Amount ━━━');
  const swapAmount = ethers.parseEther('0.01'); // $1000 worth

  if (swapAmount <= btcBal) {
    try {
      const approveTx = await btc.approve(routerAddress, swapAmount);
      await approveTx.wait();

      const path = [btcAddress, musdAddress];
      await router.swapExactTokensForTokens.staticCall(
        swapAmount,
        0,
        path,
        user.address,
        Math.floor(Date.now() / 1000) + 300
      );

      console.log('✅ Swap simulation passed!');

      const tx = await router.swapExactTokensForTokens(
        swapAmount,
        0,
        path,
        user.address,
        Math.floor(Date.now() / 1000) + 300
      );
      await tx.wait();
      console.log('✅✅ Swap succeeded!');
    } catch (error: any) {
      console.log('❌ Swap still fails');
      console.log('   Error:', error.message.split('\n')[0]);
    }
  } else {
    console.log('⏭️  Skipping (insufficient BTC)');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
