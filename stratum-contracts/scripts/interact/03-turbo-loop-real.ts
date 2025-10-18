import { ethers } from 'hardhat';
import * as deployedAddresses from '../../ignition/deployments/chain-31611/deployed_addresses.json';

/**
 * Execute Turbo Loop with REAL bMUSD/MUSD pool
 */
async function main() {
  const [user] = await ethers.getSigners();
  console.log('User address:', user.address);

  // Load contracts
  const turboLoopAddress = deployedAddresses['StratumFiFinal#TurboLoopReal'];
  const debtManagerAddress = deployedAddresses['StratumFiFinal#DebtManager'];
  const bmusdAddress = deployedAddresses['StratumFiFinal#bMUSD'];
  const musdAddress = '0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503';

  const turboLoop = await ethers.getContractAt(
    'TurboLoopReal',
    turboLoopAddress
  );
  const debtManager = await ethers.getContractAt(
    'DebtManager',
    debtManagerAddress
  );
  const bmusd = await ethers.getContractAt('IERC20', bmusdAddress);
  const musd = await ethers.getContractAt('IERC20', musdAddress);

  // Check available capacity
  const [maxBorrow, currentDebt, available] =
    await debtManager.getBorrowingCapacity(user.address);

  console.log('\n📊 Borrowing Capacity:');
  console.log('Available:', ethers.formatEther(available), 'bMUSD');

  if (available === 0n) {
    console.error('❌ No borrowing capacity. Deposit more BTC!');
    return;
  }

  // Use remaining capacity
  const bmusdAmount = available;
  const musdAmount = bmusdAmount; // 1:1 for stable pair

  console.log('\n🚀 Executing Turbo Loop (Real Tigris Pool!)');
  console.log('bMUSD to loop:', ethers.formatEther(bmusdAmount));
  console.log('MUSD to pair:', ethers.formatEther(musdAmount));

  // Check if user has enough MUSD
  const musdBalance = await musd.balanceOf(user.address);
  console.log('\nYour MUSD balance:', ethers.formatEther(musdBalance));

  if (musdBalance < musdAmount) {
    console.error('\n❌ Insufficient MUSD to pair');
    console.log('Need:', ethers.formatEther(musdAmount));
    console.log('Have:', ethers.formatEther(musdBalance));
    return;
  }

  // Step 1: Borrow more bMUSD
  console.log('\n1️⃣ Borrowing bMUSD...');
  const borrowTx = await debtManager.borrow(bmusdAmount);
  await borrowTx.wait();
  console.log('✅ Borrowed', ethers.formatEther(bmusdAmount), 'bMUSD');

  // Step 2: Approve both tokens for TurboLoop
  console.log('\n2️⃣ Approving tokens...');
  let tx = await bmusd.approve(turboLoop.target, ethers.MaxUint256);
  await tx.wait();
  tx = await musd.approve(turboLoop.target, ethers.MaxUint256);
  await tx.wait();
  console.log('✅ Approved');

  // Step 3: Execute TurboLoop
  console.log('\n3️⃣ Executing TurboLoop...');
  console.log('⭐ Adding to REAL bMUSD/MUSD pool on Tigris!');

  try {
    const loopTx = await turboLoop.loop(bmusdAmount, musdAmount);
    await loopTx.wait();
    console.log('✅ Turbo Loop executed successfully!');

    // Check secondary LP balance
    const secondaryLP = await turboLoop.getSecondaryLP(user.address);
    console.log(
      '\n💎 Your bMUSD/MUSD LP tokens:',
      ethers.formatEther(secondaryLP)
    );

    // Check updated debt
    const newDebt = await debtManager.userDebt(user.address);
    console.log('Your total debt:', ethers.formatEther(newDebt), 'bMUSD');

    console.log('\n🎉 SUCCESS!');
    console.log('You are now earning yield from TWO pools:');
    console.log('  1. MUSD/BTC (pays down debt)');
    console.log('  2. bMUSD/MUSD (extra yield)');
  } catch (error: any) {
    console.log('❌ Failed');
    console.log('Error:', error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
