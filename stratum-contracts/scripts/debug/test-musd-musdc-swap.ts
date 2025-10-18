import { ethers } from 'hardhat';

async function main() {
  const [user] = await ethers.getSigners();

  const routerAddress = '0x9a1ff7FE3a0F69959A3fBa1F1e5ee18e1A9CD7E9';
  const musdAddress = '0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503';
  const musdcAddress = '0xe1a26db653708A2AD8F824E92Db9852410e33A59';

  const router = await ethers.getContractAt('ITigrisRouter', routerAddress);
  const musd = await ethers.getContractAt('IERC20', musdAddress);

  console.log('\n🔄 Testing MUSD -> mUSDC Swap\n');

  const swapAmount = ethers.parseEther('5');
  console.log('Swapping:', ethers.formatEther(swapAmount), 'MUSD');

  // Approve
  const approveTx = await musd.approve(routerAddress, swapAmount);
  await approveTx.wait();
  console.log('✅ Approved');

  // Swap
  try {
    const path = [musdAddress, musdcAddress];
    const tx = await router.swapExactTokensForTokens(
      swapAmount,
      0,
      path,
      user.address,
      Math.floor(Date.now() / 1000) + 600
    );
    await tx.wait();
    console.log('✅ Swap worked!');
  } catch (e: any) {
    console.log('❌ Swap failed:', e.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
