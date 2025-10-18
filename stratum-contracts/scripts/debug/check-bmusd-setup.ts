import { ethers } from 'hardhat';
import * as deployedAddresses from '../ignition/deployments/chain-31611/deployed_addresses.json';

async function main() {
  const bmusd = await ethers.getContractAt(
    'bMUSD',
    deployedAddresses['StratumFi#bMUSD']
  );
  
  const debtManagerAddress = deployedAddresses['StratumFi#DebtManager'];
  
  console.log('\n🔍 CHECKING bMUSD SETUP\n');
  
  const setDebtManager = await bmusd.debtManager();
  console.log('DebtManager in bMUSD:', setDebtManager);
  console.log('Expected:', debtManagerAddress);
  console.log('Match:', setDebtManager === debtManagerAddress);
  
  if (setDebtManager === ethers.ZeroAddress) {
    console.log('\n❌ PROBLEM FOUND: DebtManager not set in bMUSD!');
    console.log('Need to call: bMUSD.setDebtManager(debtManagerAddress)');
  } else if (setDebtManager !== debtManagerAddress) {
    console.log('\n❌ PROBLEM: Wrong DebtManager set!');
  } else {
    console.log('\n✅ bMUSD setup is correct');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

