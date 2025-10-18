import { ethers } from 'hardhat';

/**
 * Let's inspect what the UI might be calling differently
 */
async function main() {
  console.log('\n🔍 INSPECTING POOL AND ROUTER\n');

  const routerAddress = '0x9a1ff7FE3a0F69959A3fBa1F1e5ee18e1A9CD7E9';
  const poolAddress = '0xd16A5Df82120ED8D626a1a15232bFcE2366d6AA9';
  const factoryAddress = '0x4947243CC818b627A5D06d14C4eCe7398A23Ce1A';
  const btcAddress = '0x7b7C000000000000000000000000000000000000';
  const musdAddress = '0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503';

  // Check code sizes
  console.log('📦 Contract Sizes:');
  const routerCode = await ethers.provider.getCode(routerAddress);
  const poolCode = await ethers.provider.getCode(poolAddress);
  const factoryCode = await ethers.provider.getCode(factoryAddress);

  console.log('Router:', routerCode.length, 'bytes');
  console.log('Pool:', poolCode.length, 'bytes ⚠️  SUSPICIOUSLY SMALL');
  console.log('Factory:', factoryCode.length, 'bytes');

  // Try to get pool from factory
  console.log('\n🏭 Checking Factory:');
  try {
    // Try getPair function
    const getPairData = ethers.AbiCoder.defaultAbiCoder().encode(
      ['address', 'address'],
      [musdAddress, btcAddress]
    );
    const getPairSig = '0xe6a43905'; // getPair(address,address)

    const result = await ethers.provider.call({
      to: factoryAddress,
      data: getPairSig + getPairData.slice(2),
    });

    const pairFromFactory = ethers.AbiCoder.defaultAbiCoder().decode(
      ['address'],
      result
    )[0];
    console.log('Pair from factory:', pairFromFactory);
    console.log(
      'Matches our pool:',
      pairFromFactory.toLowerCase() === poolAddress.toLowerCase()
    );

    if (pairFromFactory.toLowerCase() !== poolAddress.toLowerCase()) {
      console.log('⚠️  DIFFERENT POOL ADDRESS FROM FACTORY!');
      console.log('We should use:', pairFromFactory);
    }
  } catch (e: any) {
    console.log('Could not get pair from factory:', e.message);
  }

  // Check if pool is a proxy
  console.log('\n🔗 Checking if Pool is a Proxy:');
  try {
    // Check for proxy implementation slot
    const implSlot =
      '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';
    const impl = await ethers.provider.getStorage(poolAddress, implSlot);
    console.log('Implementation slot:', impl);

    if (impl !== '0x' + '0'.repeat(64)) {
      const implAddress = '0x' + impl.slice(26);
      console.log('Pool is a proxy! Implementation:', implAddress);
      const implCode = await ethers.provider.getCode(implAddress);
      console.log('Implementation code length:', implCode.length, 'bytes');
    }
  } catch (e) {
    console.log('Not a standard proxy');
  }

  // Check router functions available
  console.log('\n📋 Router Functions:');
  const router = await ethers.getContractAt('ITigrisRouter', routerAddress);

  try {
    const factory = await ethers.provider.call({
      to: routerAddress,
      data: '0xc45a0155', // factory()
    });
    console.log(
      "Router's factory:",
      ethers.AbiCoder.defaultAbiCoder().decode(['address'], factory)[0]
    );
  } catch (e) {
    console.log('No factory() function');
  }

  // Try different function signatures
  console.log('\n🔬 Testing Different Function Signatures:');

  const functionSigs = [
    { name: 'addLiquidity', sig: '0xe8e33700' },
    { name: 'addLiquidityETH', sig: '0xf305d719' },
    { name: 'addLiquidityAVAX', sig: '0xf91b3f72' },
    { name: 'sortTokens', sig: '0x544caa56' },
    { name: 'pairFor', sig: '0x81007d75' },
  ];

  for (const func of functionSigs) {
    try {
      const result = await ethers.provider.call({
        to: routerAddress,
        data: func.sig,
      });
      console.log(`✅ ${func.name} exists`);
    } catch (e) {
      console.log(`❌ ${func.name} not found`);
    }
  }

  console.log('\n💡 NEXT STEPS:');
  console.log('1. Check what contract addresses the Mezo UI actually calls');
  console.log('2. Use browser DevTools > Network tab when adding liquidity');
  console.log('3. Look for contract calls to see exact parameters used');
  console.log('4. Share those transaction hashes so we can inspect them');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
