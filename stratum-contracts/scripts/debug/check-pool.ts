import { ethers } from 'hardhat';

async function main() {
  const poolAddress = '0xd16A5Df82120ED8D626a1a15232bFcE2366d6AA9';
  const factoryAddress = '0x4947243CC818b627A5D06d14C4eCe7398A23Ce1A';

  const pool = await ethers.getContractAt('ITigrisPool', poolAddress);

  console.log('\n🔍 Checking Pool State\n');

  try {
    const token0 = await pool.token0();
    const token1 = await pool.token1();
    const [reserve0, reserve1] = await pool.getReserves();
    const totalSupply = await pool.totalSupply();

    console.log('Token0:', token0);
    console.log('Token1:', token1);
    console.log('Reserve0:', ethers.formatEther(reserve0));
    console.log('Reserve1:', ethers.formatEther(reserve1));
    console.log('Total LP Supply:', ethers.formatEther(totalSupply));

    // Try to call other functions
    console.log('\n✅ Pool is accessible');
  } catch (error: any) {
    console.error('❌ Error accessing pool:', error.message);
  }

  // Check if pool has any special properties
  const poolCode = await ethers.provider.getCode(poolAddress);
  console.log('\nPool has code:', poolCode !== '0x');
  console.log('Code length:', poolCode.length);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
