import { ethers } from 'hardhat';
import * as deployedAddresses from '../ignition/deployments/chain-31611/deployed_addresses.json';

async function main() {
  const [user] = await ethers.getSigners();

  const factoryAddress = '0x4947243CC818b627A5D06d14C4eCe7398A23Ce1A';
  const bmusdAddress = deployedAddresses['StratumFiFinal#bMUSD'];
  const musdAddress = '0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503';

  console.log('\n🔍 Checking Pool Creation Status\n');
  console.log('Factory:', factoryAddress);
  console.log('bMUSD:', bmusdAddress);
  console.log('MUSD:', musdAddress);

  const factory = new ethers.Contract(
    factoryAddress,
    [
      'function createPool(address tokenA, address tokenB, bool stable) returns (address pool)',
      'function getPool(address tokenA, address tokenB, bool stable) view returns (address pool)',
      'function allPoolsLength() view returns (uint256)',
    ],
    user
  );

  // Try to get existing pool
  console.log('\n1️⃣ Checking if pool already exists...');
  try {
    const existingPool = await factory.getPool(bmusdAddress, musdAddress, true);
    console.log('Existing pool:', existingPool);

    if (existingPool !== ethers.ZeroAddress) {
      console.log('✅ Pool already exists! Can use:', existingPool);
      return;
    }
  } catch (e) {
    console.log('No getPool function, trying createPool...');
  }

  // Try to create
  console.log('\n2️⃣ Attempting to create pool...');
  try {
    const poolAddress = await factory.createPool.staticCall(
      bmusdAddress,
      musdAddress,
      true
    );
    console.log('StaticCall result:', poolAddress);

    const tx = await factory.createPool(bmusdAddress, musdAddress, true);
    await tx.wait();
    console.log('✅ Pool created:', poolAddress);
  } catch (e: any) {
    console.log('❌ Creation failed:', e.message);
    console.log('\n💡 Possible reasons:');
    console.log('   - Pool limit reached per user');
    console.log('   - Factory paused');
    console.log('   - Need special permissions');
    console.log('   - Token pair not allowed');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
