import { ethers } from 'hardhat';

async function main() {
  const musdtPoolAddress = '0x27414B76CF00E24ed087adb56E26bAeEEe93494e';

  console.log('\n🔍 Checking MUSD/mUSDT Pool\n');

  const pool = await ethers.getContractAt('ITigrisPool', musdtPoolAddress);

  try {
    const token0 = await pool.token0();
    const token1 = await pool.token1();
    const [reserve0, reserve1] = await pool.getReserves();

    console.log('Pool Address:', musdtPoolAddress);
    console.log('Token0:', token0);
    console.log('Token1:', token1);
    console.log('Reserve0:', ethers.formatEther(reserve0));
    console.log('Reserve1:', ethers.formatEther(reserve1));

    if (
      BigInt(reserve0) > ethers.parseEther('100') &&
      BigInt(reserve1) > ethers.parseEther('100')
    ) {
      console.log('\n✅ MUSD/mUSDT has good liquidity!');
      console.log('💡 We can use this instead of MUSD/mUSDC!');
    } else {
      console.log('\n⚠️  Low liquidity on this pool too');
    }
  } catch (e: any) {
    console.log('❌ Error:', e.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
