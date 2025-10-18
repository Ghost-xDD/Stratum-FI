import { ethers } from 'hardhat';

async function main() {
  const [user] = await ethers.getSigners();

  const routerAddress = '0x9a1ff7FE3a0F69959A3fBa1F1e5ee18e1A9CD7E9';
  const btcAddress = '0x7b7C000000000000000000000000000000000000';
  const musdAddress = '0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503';

  const router = await ethers.getContractAt('ITigrisRouter', routerAddress);
  const btc = await ethers.getContractAt('IERC20', btcAddress);
  const musd = await ethers.getContractAt('IERC20', musdAddress);

  // Check balances
  const btcBal = await btc.balanceOf(user.address);
  const musdBal = await musd.balanceOf(user.address);

  console.log('\n🔍 Testing Tigris Router Direct Call\n');
  console.log('Your BTC balance:', ethers.formatEther(btcBal));
  console.log('Your MUSD balance:', ethers.formatEther(musdBal));

  // Try to add small liquidity
  const btcAmount = ethers.parseEther('0.0001');
  const musdAmount = ethers.parseEther('1');

  console.log('\n📝 Attempting to add liquidity:');
  console.log('  BTC:', ethers.formatEther(btcAmount));
  console.log('  MUSD:', ethers.formatEther(musdAmount));

  // Approve
  console.log('\n1. Approving tokens...');
  const approveBtcTx = await btc.approve(routerAddress, btcAmount);
  await approveBtcTx.wait();
  const approveMusdTx = await musd.approve(routerAddress, musdAmount);
  await approveMusdTx.wait();
  console.log('✅ Approved');

  // Try add liquidity
  console.log('\n2. Adding liquidity...');
  try {
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
    console.log('✅ Success!');
  } catch (error: any) {
    console.error('❌ Failed:', error.message);

    // Try to get revert reason
    if (error.data) {
      console.log('Revert data:', error.data);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
