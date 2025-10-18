import { ethers } from 'hardhat';
import * as deployedAddresses from '../../ignition/deployments/chain-31611/deployed_addresses.json';

/**
 * Fund StrategyBTC with more MUSD so it can accept more BTC deposits
 */
async function main() {
  const [admin] = await ethers.getSigners();

  const strategyAddress = deployedAddresses['StratumFiFinal#StrategyBTC'];
  const musdAddress = '0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503';

  const strategy = await ethers.getContractAt('StrategyBTC', strategyAddress);
  const musd = await ethers.getContractAt('IERC20', musdAddress);

  console.log('\n💸 Funding StrategyBTC with More MUSD\n');

  const amount = ethers.parseEther('20'); // 20 MUSD

  const balance = await musd.balanceOf(admin.address);
  console.log('Your MUSD:', ethers.formatEther(balance));
  console.log('Funding with:', ethers.formatEther(amount));

  if (balance < amount) {
    console.log('❌ Insufficient MUSD');
    return;
  }

  const tx1 = await musd.approve(strategyAddress, amount);
  await tx1.wait();

  const tx2 = await strategy.fundWithMUSD(amount);
  await tx2.wait();

  console.log('✅ Funded!');

  const strategyBalance = await musd.balanceOf(strategyAddress);
  console.log(
    '\nStrategyBTC MUSD balance:',
    ethers.formatEther(strategyBalance)
  );
  console.log('\n✅ Now you can deposit more BTC!');
  console.log('Run: npm run get-bmusd');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
