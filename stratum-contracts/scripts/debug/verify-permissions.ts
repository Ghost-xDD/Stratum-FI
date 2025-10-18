import { ethers } from 'hardhat';

async function main() {
  const [user] = await ethers.getSigners();

  const routerAddress = '0x9a1ff7FE3a0F69959A3fBa1F1e5ee18e1A9CD7E9';
  const poolAddress = '0xd16A5Df82120ED8D626a1a15232bFcE2366d6AA9';
  const factoryAddress = '0x4947243CC818b627A5D06d14C4eCe7398A23Ce1A';

  console.log('\n🔍 CHECKING FOR PERMISSIONS & RESTRICTIONS\n');
  console.log('User:', user.address);

  // Check Router
  console.log('\n━━━ ROUTER ━━━');
  console.log('Address:', routerAddress);

  const routerCode = await ethers.provider.getCode(routerAddress);
  console.log('Has code:', routerCode !== '0x');

  // Try common permission checks
  try {
    // Check for paused state
    const isPaused = await ethers.provider.call({
      to: routerAddress,
      data: '0x5c975abb', // paused()
    });
    console.log('Paused check result:', isPaused);
  } catch (e) {
    console.log('No paused() function');
  }

  try {
    // Check for owner
    const owner = await ethers.provider.call({
      to: routerAddress,
      data: '0x8da5cb5b', // owner()
    });
    console.log(
      'Owner:',
      ethers.AbiCoder.defaultAbiCoder().decode(['address'], owner)[0]
    );
  } catch (e) {
    console.log('No owner() function');
  }

  // Check Pool
  console.log('\n━━━ POOL ━━━');
  console.log('Address:', poolAddress);

  try {
    const pool = await ethers.getContractAt('ITigrisPool', poolAddress);
    const token0 = await pool.token0();
    const token1 = await pool.token1();
    console.log('Token0:', token0);
    console.log('Token1:', token1);
  } catch (e: any) {
    console.log('Error:', e.message);
  }

  // Check Factory
  console.log('\n━━━ FACTORY ━━━');
  console.log('Address:', factoryAddress);

  try {
    // Check if factory is paused
    const factoryPaused = await ethers.provider.call({
      to: factoryAddress,
      data: '0x5c975abb',
    });
    console.log(
      'Factory paused:',
      factoryPaused !==
        '0x0000000000000000000000000000000000000000000000000000000000000000'
    );
  } catch (e) {
    console.log('No paused() on factory');
  }

  try {
    // Check factory voter (controls permissions)
    const voter = await ethers.provider.call({
      to: factoryAddress,
      data: '0x46c96aac', // voter()
    });
    const voterAddress = ethers.AbiCoder.defaultAbiCoder().decode(
      ['address'],
      voter
    )[0];
    console.log('Voter (controls permissions):', voterAddress);

    // Check if our user is allowed
    const isGaugeData = ethers.AbiCoder.defaultAbiCoder().encode(
      ['address'],
      [poolAddress]
    );
    const isGaugeCall = '0x96d4d21d' + isGaugeData.slice(2); // isGauge(address)

    try {
      const isGauge = await ethers.provider.call({
        to: voterAddress,
        data: isGaugeCall,
      });
      console.log(
        'Pool has gauge:',
        isGauge !==
          '0x0000000000000000000000000000000000000000000000000000000000000000'
      );
    } catch (e) {
      console.log('Cannot check gauge status');
    }
  } catch (e) {
    console.log('No voter() on factory');
  }

  // Try to simulate addLiquidity call
  console.log('\n━━━ SIMULATION TEST ━━━');

  const btcAddress = '0x7b7C000000000000000000000000000000000000';
  const musdAddress = '0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503';
  const btcAmount = ethers.parseEther('0.0001');
  const musdAmount = ethers.parseEther('1');

  const router = await ethers.getContractAt('ITigrisRouter', routerAddress);

  try {
    // Try staticCall (simulation)
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
    console.log('✅ Simulation passed - should work!');
  } catch (error: any) {
    console.log('❌ Simulation failed');
    console.log('Error:', error.message);

    // Try to decode the revert reason
    if (error.data) {
      console.log('Revert data:', error.data);

      // Try common error signatures
      const errorSigs = {
        '0x08c379a0': 'Error(string)', // Standard revert
        '0x4e487b71': 'Panic(uint256)',
        '0x82b42900': 'Unauthorized()',
        '0xd92e233d': 'Forbidden()',
      };

      const sig = error.data.slice(0, 10);
      if (errorSigs[sig as keyof typeof errorSigs]) {
        console.log('Error type:', errorSigs[sig as keyof typeof errorSigs]);

        if (sig === '0x08c379a0') {
          try {
            const reason = ethers.AbiCoder.defaultAbiCoder().decode(
              ['string'],
              '0x' + error.data.slice(10)
            )[0];
            console.log('Revert reason:', reason);
          } catch (e) {
            console.log('Could not decode revert reason');
          }
        }
      }
    }
  }

  // Check specific pool functions
  console.log('\n━━━ POOL FUNCTIONS ━━━');

  const pool = await ethers.getContractAt('ITigrisPool', poolAddress);

  // Check if pool has any mint restrictions
  const poolAbi = [
    'function stable() view returns (bool)',
    'function isPair() view returns (bool)',
    'function factory() view returns (address)',
  ];

  for (const func of poolAbi) {
    try {
      const iface = new ethers.Interface([`function ${func}`]);
      const data = iface.encodeFunctionData(func.split('(')[0], []);
      const result = await ethers.provider.call({
        to: poolAddress,
        data,
      });
      console.log(`${func.split('(')[0]}():`, result);
    } catch (e) {
      console.log(`${func.split('(')[0]}(): not available`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
