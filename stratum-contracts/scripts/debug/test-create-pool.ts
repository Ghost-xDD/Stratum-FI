import { ethers } from 'hardhat';
import * as deployedAddresses from '../ignition/deployments/chain-31611/deployed_addresses.json';

async function main() {
  const [user] = await ethers.getSigners();

  const factoryAddress = '0x4947243CC818b627A5D06d14C4eCe7398A23Ce1A';
  const bmusdAddress = deployedAddresses['StratumFi#bMUSD'];
  const musdAddress = '0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503';

  console.log('\n🏭 TESTING POOL CREATION\n');
  console.log('Factory:', factoryAddress);
  console.log('bMUSD:', bmusdAddress);
  console.log('MUSD:', musdAddress);

  // Test different factory function signatures
  const factoryAbis = [
    // Standard Uniswap V2 style
    'function createPair(address tokenA, address tokenB) returns (address pair)',
    // Aerodrome style with stable parameter
    'function createPair(address tokenA, address tokenB, bool stable) returns (address pair)',
    // Velodrome style
    'function createPool(address tokenA, address tokenB, bool stable) returns (address pool)',
  ];

  for (let i = 0; i < factoryAbis.length; i++) {
    console.log(`\n${i + 1}️⃣ Testing: ${factoryAbis[i].split('(')[0]}`);

    try {
      const factory = new ethers.Contract(
        factoryAddress,
        [factoryAbis[i]],
        user
      );

      let tx;
      const funcName = factoryAbis[i].split('(')[0].split(' ').pop()!;

      if (factoryAbis[i].includes('bool stable')) {
        console.log('   Calling with stable=false...');
        tx = await factory[funcName].staticCall(
          bmusdAddress,
          musdAddress,
          false
        );
      } else {
        tx = await factory[funcName].staticCall(bmusdAddress, musdAddress);
      }

      console.log('✅ STATIC CALL PASSED!');
      console.log('   Would create pool at:', tx);

      // Try actual transaction
      console.log('   Attempting real transaction...');
      let realTx;
      if (factoryAbis[i].includes('bool stable')) {
        realTx = await factory[funcName](bmusdAddress, musdAddress, false);
      } else {
        realTx = await factory[funcName](bmusdAddress, musdAddress);
      }

      await realTx.wait();
      console.log('✅✅ POOL CREATED SUCCESSFULLY!');
      console.log('   Pool address:', tx);
      console.log('\n🎉 WE CAN CREATE POOLS! This changes everything!');
      return;
    } catch (e: any) {
      console.log('❌ Failed:', e.message.split('\n')[0]);
    }
  }

  console.log('\n❌ CONCLUSION: Cannot create new pools (permissioned)');
  console.log('💡 Must use MockMUSDCPool approach for hackathon');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
