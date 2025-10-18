import { ethers } from 'hardhat';
import * as deployedAddresses from '../ignition/deployments/chain-31611/deployed_addresses.json';

async function main() {
  const [user] = await ethers.getSigners();

  const turboLoop = await ethers.getContractAt(
    'TurboLoop',
    deployedAddresses['StratumFi#TurboLoop']
  );

  const mockSwap = await ethers.getContractAt(
    'MockTigrisSwap',
    deployedAddresses['StratumFi#MockTigrisSwap']
  );

  const bmusd = await ethers.getContractAt(
    'bMUSD',
    deployedAddresses['StratumFi#bMUSD']
  );

  const musd = await ethers.getContractAt(
    'IERC20',
    '0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503'
  );

  console.log('\n🔍 DEBUGGING TURBO LOOP\n');

  // Check MockSwap setup
  console.log('MockSwap Setup:');
  const mockSwapMusd = await musd.balanceOf(mockSwap.target);
  console.log('  MUSD balance:', ethers.formatEther(mockSwapMusd));

  // Check if bMUSD is approved for MockSwap
  const bmusdAllowance = await bmusd.allowance(
    turboLoop.target,
    mockSwap.target
  );
  console.log(
    '  TurboLoop->MockSwap bMUSD allowance:',
    ethers.formatEther(bmusdAllowance)
  );

  // Check user's bMUSD balance
  const userBmusd = await bmusd.balanceOf(user.address);
  console.log('\nUser bMUSD balance:', ethers.formatEther(userBmusd));

  // Test manual swap first
  console.log('\n🧪 Testing MockSwap directly...');
  const swapAmount = ethers.parseEther('0.5');

  try {
    // Approve
    const approveTx = await bmusd.approve(mockSwap.target, swapAmount);
    await approveTx.wait();

    // Swap
    const tx = await mockSwap.swap(swapAmount);
    await tx.wait();
    console.log('✅ Direct swap worked!');

    const musdReceived = await musd.balanceOf(user.address);
    console.log('MUSD received:', ethers.formatEther(musdReceived));
  } catch (e: any) {
    console.log('❌ Direct swap failed:', e.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
