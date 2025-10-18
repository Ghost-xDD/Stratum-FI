import { ethers } from 'hardhat';

async function main() {
  const [user] = await ethers.getSigners();

  const routerAddress = '0x9a1ff7FE3a0F69959A3fBa1F1e5ee18e1A9CD7E9';
  const btcAddress = '0x7b7C000000000000000000000000000000000000';
  const musdAddress = '0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503';

  console.log('\n🔄 TRYING TO SWAP MUSD -> BTC\n');

  const router = await ethers.getContractAt('ITigrisRouter', routerAddress);
  const musd = await ethers.getContractAt('IERC20', musdAddress);

  const swapAmount = ethers.parseEther('10'); // 10 MUSD

  console.log('Swapping', ethers.formatEther(swapAmount), 'MUSD for BTC');

  const approveTx = await musd.approve(routerAddress, swapAmount);
  await approveTx.wait();
  console.log('✅ Approved');

  try {
    const path = [musdAddress, btcAddress];
    const tx = await router.swapExactTokensForTokens(
      swapAmount,
      0,
      path,
      user.address,
      Math.floor(Date.now() / 1000) + 300
    );
    await tx.wait();
    console.log('✅ SWAP WORKED!');
    console.log('This means:');
    console.log('- Router is functional');
    console.log('- Pool allows swaps');
    console.log('❌ But addLiquidity is restricted/permissioned');
  } catch (error: any) {
    console.log('❌ SWAP FAILED');
    console.log('Error:', error.message);
    console.log('This means the entire pool might be restricted');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
