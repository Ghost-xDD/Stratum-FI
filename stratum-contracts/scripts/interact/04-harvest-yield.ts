import { ethers } from 'hardhat';
import * as deployedAddresses from '../../ignition/deployments/chain-31611/deployed_addresses.json';

/**
 * Harvest yield from LP positions
 * Can be called by anyone (keeper bot)
 */
async function main() {
  const [keeper] = await ethers.getSigners();
  console.log('Keeper address:', keeper.address);

  // Load contracts
  const harvesterAddress =
    deployedAddresses['StratumFiFinal#Harvester'] ||
    deployedAddresses['StratumFi#Harvester'];
  const debtManagerAddress =
    deployedAddresses['StratumFiFinal#DebtManager'] ||
    deployedAddresses['StratumFi#DebtManager'];

  const harvester = await ethers.getContractAt('Harvester', harvesterAddress);
  const debtManager = await ethers.getContractAt(
    'DebtManager',
    debtManagerAddress
  );

  // Check claimable yield
  console.log('\n📊 Checking claimable yield...');

  let claimable0 = 0n;
  let claimable1 = 0n;

  try {
    [claimable0, claimable1] = await harvester.getClaimableYield();
    console.log('Claimable token0:', ethers.formatEther(claimable0));
    console.log('Claimable token1:', ethers.formatEther(claimable1));
  } catch (e) {
    console.log('⏳ No yield claimable yet (pool needs trading activity)');
  }

  if (claimable0 === 0n && claimable1 === 0n) {
    console.log('💡 Trade in MUSD/BTC pool to generate fees!');
    console.log('   Even small trades will create harvestable yield');
  }

  // Check total debt before
  const debtBefore = await debtManager.totalDebt();
  console.log(
    '\n💰 Total protocol debt before:',
    ethers.formatEther(debtBefore),
    'bMUSD'
  );

  // Harvest
  console.log('\n🌾 Harvesting yield...');
  const harvestTx = await harvester.harvest();
  await harvestTx.wait();
  console.log('✅ Harvest complete!');

  // Check total debt after
  const debtAfter = await debtManager.totalDebt();
  console.log(
    '\n💰 Total protocol debt after:',
    ethers.formatEther(debtAfter),
    'bMUSD'
  );

  const debtReduction = debtBefore - debtAfter;
  console.log('💸 Debt paid down:', ethers.formatEther(debtReduction), 'bMUSD');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
