import { ethers } from 'hardhat';

async function main() {
  const [user] = await ethers.getSigners();

  const voterAddress = '0x68ad60CC5e8f3B7cC53beaB321cf0e6036962dBc';
  const poolAddress = '0xd16A5Df82120ED8D626a1a15232bFcE2366d6AA9';

  console.log('\n🔍 CHECKING VOTER CONTRACT\n');
  console.log('Voter:', voterAddress);
  console.log('User:', user.address);
  console.log('Pool:', poolAddress);

  // Check if voter has whitelist
  const voterAbi = [
    'function isWhitelisted(address) view returns (bool)',
    'function isAlive(address) view returns (bool)',
    'function gauges(address) view returns (address)',
    'function poolForGauge(address) view returns (address)',
    'function weights(address) view returns (uint256)',
  ];

  for (const funcSig of voterAbi) {
    try {
      const iface = new ethers.Interface([funcSig]);
      const funcName = funcSig.split('(')[0].split(' ').pop()!;

      let param;
      if (funcSig.includes('isWhitelisted') || funcSig.includes('isAlive')) {
        param = user.address;
      } else {
        param = poolAddress;
      }

      const data = iface.encodeFunctionData(funcName, [param]);
      const result = await ethers.provider.call({
        to: voterAddress,
        data,
      });

      if (funcSig.includes('bool')) {
        const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
          ['bool'],
          result
        );
        console.log(`${funcName}(${param.slice(0, 10)}...):`, decoded[0]);
      } else if (funcSig.includes('address')) {
        const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
          ['address'],
          result
        );
        console.log(`${funcName}(${param.slice(0, 10)}...):`, decoded[0]);
      } else {
        console.log(`${funcName}(${param.slice(0, 10)}...):`, result);
      }
    } catch (e: any) {
      const funcName = funcSig.split('(')[0].split(' ').pop();
      console.log(`${funcName}(): not available or error`);
    }
  }

  // Check the gauge for the pool
  console.log('\n━━━ GAUGE CHECK ━━━');
  try {
    const iface = new ethers.Interface([
      'function gauges(address) view returns (address)',
    ]);
    const data = iface.encodeFunctionData('gauges', [poolAddress]);
    const result = await ethers.provider.call({
      to: voterAddress,
      data,
    });
    const gaugeAddress = ethers.AbiCoder.defaultAbiCoder().decode(
      ['address'],
      result
    )[0];
    console.log('Gauge for pool:', gaugeAddress);

    if (gaugeAddress !== ethers.ZeroAddress) {
      // Check gauge functions
      console.log('\n━━━ GAUGE FUNCTIONS ━━━');
      const gaugeAbi = [
        'function stakingToken() view returns (address)',
        'function rewardToken() view returns (address)',
        'function totalSupply() view returns (uint256)',
      ];

      for (const func of gaugeAbi) {
        try {
          const iface = new ethers.Interface([func]);
          const funcName = func.split('(')[0].split(' ').pop()!;
          const data = iface.encodeFunctionData(funcName, []);
          const result = await ethers.provider.call({
            to: gaugeAddress,
            data,
          });
          console.log(`${funcName}():`, result);
        } catch (e) {
          console.log(`${func}: not available`);
        }
      }
    }
  } catch (e: any) {
    console.log('Cannot check gauge:', e.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
