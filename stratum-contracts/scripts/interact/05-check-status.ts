import { ethers } from 'hardhat';
import * as deployedAddresses from '../../ignition/deployments/chain-31611/deployed_addresses.json';

/**
 * Check your position status
 */
async function main() {
  const [user] = await ethers.getSigners();
  console.log('User address:', user.address);

  // Load contracts (handle both deployment versions)
  const vaultAddress =
    deployedAddresses['StratumFiFinal#VaultController'] ||
    deployedAddresses['StratumFi#VaultController'];
  const debtManagerAddress =
    deployedAddresses['StratumFiFinal#DebtManager'] ||
    deployedAddresses['StratumFi#DebtManager'];
  const strategyAddress =
    deployedAddresses['StratumFiFinal#StrategyBTC'] ||
    deployedAddresses['StratumFi#StrategyBTC'];
  const turboLoopAddress =
    deployedAddresses['StratumFiFinal#TurboLoopReal'] ||
    deployedAddresses['StratumFi#TurboLoop'];
  const harvesterAddress =
    deployedAddresses['StratumFiFinal#Harvester'] ||
    deployedAddresses['StratumFi#Harvester'];

  const vaultController = await ethers.getContractAt(
    'VaultController',
    vaultAddress
  );
  const debtManager = await ethers.getContractAt(
    'DebtManager',
    debtManagerAddress
  );
  const strategy = await ethers.getContractAt('StrategyBTC', strategyAddress);
  const turboLoop = await ethers.getContractAt(
    'TurboLoopReal',
    turboLoopAddress
  );
  const harvester = await ethers.getContractAt('Harvester', harvesterAddress);

  console.log('\n╔════════════════════════════════════════╗');
  console.log('║       STRATUM FI - YOUR POSITION       ║');
  console.log('╚════════════════════════════════════════╝');

  // Collateral
  const collateral = await vaultController.balanceOf(user.address);
  console.log('\n💎 COLLATERAL');
  console.log('  BTC Deposited:', ethers.formatEther(collateral), 'BTC');

  // Debt
  const userDebt = await debtManager.userDebt(user.address);
  const [maxBorrow, currentDebt, available] =
    await debtManager.getBorrowingCapacity(user.address);

  console.log('\n💸 DEBT');
  console.log('  Current Debt:', ethers.formatEther(userDebt), 'bMUSD');
  console.log('  Max Borrow:', ethers.formatEther(maxBorrow), 'bMUSD');
  console.log('  Available:', ethers.formatEther(available), 'bMUSD');

  // LTV calculation
  if (maxBorrow > 0n) {
    const ltv = (userDebt * 10000n) / maxBorrow;
    console.log('  LTV Ratio:', (Number(ltv) / 100).toFixed(2) + '%');
  }

  // Turbo Loop position
  const secondaryLP = await turboLoop.getSecondaryLP(user.address);
  console.log('\n🚀 TURBO LOOP');
  console.log('  MUSD/mUSDC LP:', ethers.formatEther(secondaryLP));

  // Claimable yield
  console.log('\n🌾 CLAIMABLE YIELD');
  try {
    const [claimable0, claimable1] = await harvester.getClaimableYield();
    console.log('  Token0:', ethers.formatEther(claimable0));
    console.log('  Token1:', ethers.formatEther(claimable1));
  } catch (e) {
    console.log('  Not yet available (no trades in pool yet)');
  }

  // Protocol stats
  const totalDebt = await debtManager.totalDebt();
  const totalBTCDeposited = await strategy.totalBTCDeposited();

  console.log('\n📊 PROTOCOL STATS');
  console.log('  Total BTC:', ethers.formatEther(totalBTCDeposited), 'BTC');
  console.log('  Total Debt:', ethers.formatEther(totalDebt), 'bMUSD');

  console.log('\n════════════════════════════════════════\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
