import { ethers } from 'hardhat';

async function main() {
  const routerAddress = '0x9a1ff7FE3a0F69959A3fBa1F1e5ee18e1A9CD7E9';
  const poolAddress = '0x525F049A4494dA0a6c87E3C4df55f9929765Dc3e'; // MUSD/mUSDC
  const musdAddress = '0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503';
  const musdcAddress = '0xe1a26db653708A2AD8F824E92Db9852410e33A59';

  console.log('\n🔍 Checking MUSD/mUSDC Pool\n');

  const pool = await ethers.getContractAt('ITigrisPool', poolAddress);
  const router = await ethers.getContractAt('ITigrisRouter', routerAddress);
  const musd = await ethers.getContractAt('IERC20', musdAddress);
  const musdc = await ethers.getContractAt('IERC20', musdcAddress);

  // Check pool
  const token0 = await pool.token0();
  const token1 = await pool.token1();
  const [reserve0, reserve1] = await pool.getReserves();

  console.log('Pool:', poolAddress);
  console.log('Token0:', token0);
  console.log('Token1:', token1);
  console.log('Reserve0:', ethers.formatEther(reserve0));
  console.log('Reserve1:', ethers.formatEther(reserve1));

  // Try adding liquidity (stablecoin pair should use stable=true)
  const [user] = await ethers.getSigners();
  const amount = ethers.parseEther('5');

  console.log('\n💧 Trying to add liquidity...');
  console.log('Amount:', ethers.formatEther(amount), 'of each');

  // Approve
  let tx = await musd.approve(routerAddress, amount);
  await tx.wait();
  tx = await musdc.approve(routerAddress, amount);
  await tx.wait();
  console.log('✅ Approved');

  // Try with stable=true
  console.log('\n⭐ Testing with stable=true');
  try {
    tx = await router.addLiquidity(
      musdAddress,
      musdcAddress,
      true, // stable pair
      amount,
      amount,
      0,
      0,
      user.address,
      Math.floor(Date.now() / 1000) + 600
    );
    await tx.wait();
    console.log('✅ Works with stable=true!');
  } catch (e: any) {
    console.log('❌ Failed:', e.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
