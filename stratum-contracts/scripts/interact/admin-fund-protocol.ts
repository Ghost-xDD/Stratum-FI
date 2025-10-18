import { ethers } from 'hardhat';
import * as deployedAddresses from '../../ignition/deployments/chain-31611/deployed_addresses.json';

/**
 * Admin script to fund protocol with MUSD
 * Run this ONCE after deployment
 */
async function main() {
  const [admin] = await ethers.getSigners();
  console.log('Admin address:', admin.address);

  const musdAddress = '0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503';
  const musd = await ethers.getContractAt('IERC20', musdAddress);

  // Check admin's MUSD balance
  const balance = await musd.balanceOf(admin.address);
  console.log('\n💰 Your MUSD balance:', ethers.formatEther(balance));

  if (balance === 0n) {
    console.error('❌ No MUSD balance. Mint MUSD at mezo.org first!');
    return;
  }

  // Addresses to fund (try both deployment versions)
  const strategyAddress =
    deployedAddresses['StratumFiFinal#StrategyBTC'] ||
    deployedAddresses['StratumFi#StrategyBTC'];
  const mockSwapAddress =
    deployedAddresses['StratumFiFinal#MockTigrisSwap'] ||
    deployedAddresses['StratumFi#MockTigrisSwap'];

  console.log('StrategyBTC:', strategyAddress);
  console.log(
    'MockTigrisSwap:',
    mockSwapAddress || 'Not deployed (using real pools)'
  );

  // Amounts to fund (testnet amounts)
  const strategyAmount = ethers.parseEther('2'); // 2 MUSD for LP pairing (need ~1.05 per 0.0001 BTC)
  const mockSwapAmount = ethers.parseEther('10'); // 10 MUSD for swaps

  const totalNeeded = strategyAmount + mockSwapAmount;

  console.log('\n📋 Funding Plan:');
  console.log('  StrategyBTC:', ethers.formatEther(strategyAmount), 'MUSD');
  console.log('  MockTigrisSwap:', ethers.formatEther(mockSwapAmount), 'MUSD');
  console.log('  Total needed:', ethers.formatEther(totalNeeded), 'MUSD');

  if (balance < totalNeeded) {
    console.error(
      '\n❌ Insufficient MUSD. Need',
      ethers.formatEther(totalNeeded)
    );
    console.log('You have:', ethers.formatEther(balance));
    return;
  }

  // Fund StrategyBTC
  console.log('\n💸 Funding StrategyBTC...');
  const strategy = await ethers.getContractAt('StrategyBTC', strategyAddress);

  const approveTx1 = await musd.approve(strategyAddress, strategyAmount);
  await approveTx1.wait();

  const fundTx1 = await strategy.fundWithMUSD(strategyAmount);
  await fundTx1.wait();
  console.log('✅ StrategyBTC funded');

  // Fund MockTigrisSwap (only if deployed)
  console.log('\n💸 Funding MockTigrisSwap...');
  if (
    mockSwapAddress &&
    mockSwapAddress !== 'Not deployed (using real pools)'
  ) {
    const mockSwap = await ethers.getContractAt(
      'MockTigrisSwap',
      mockSwapAddress
    );

    const approveTx2 = await musd.approve(mockSwapAddress, mockSwapAmount);
    await approveTx2.wait();

    const fundTx2 = await mockSwap.fund(mockSwapAmount);
    await fundTx2.wait();
    console.log('✅ MockTigrisSwap funded');
  } else {
    console.log('⏭️  Skipped (using real Tigris pools)');
  }

  // Verify
  console.log('\n✅ PROTOCOL FUNDED SUCCESSFULLY!');

  const strategyBalance = await musd.balanceOf(strategyAddress);

  console.log('\n📊 Contract Balances:');
  console.log('  StrategyBTC:', ethers.formatEther(strategyBalance), 'MUSD');

  if (mockSwapAddress) {
    const mockSwapBalance = await musd.balanceOf(mockSwapAddress);
    console.log(
      '  MockTigrisSwap:',
      ethers.formatEther(mockSwapBalance),
      'MUSD'
    );
  }

  console.log('\n🚀 Protocol ready for users!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
