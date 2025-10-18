import { ethers } from 'hardhat';
import * as deployedAddresses from '../ignition/deployments/chain-31611/deployed_addresses.json';

async function main() {
  const [user] = await ethers.getSigners();

  const strategyAddress = deployedAddresses['StratumFi#StrategyBTC'];
  const vaultAddress = deployedAddresses['StratumFi#VaultController'];

  const strategy = await ethers.getContractAt('StrategyBTC', strategyAddress);
  const vault = await ethers.getContractAt('VaultController', vaultAddress);

  const btcAddress = '0x7b7C000000000000000000000000000000000000';
  const musdAddress = '0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503';
  const poolAddress = '0xd16A5Df82120ED8D626a1a15232bFcE2366d6AA9';

  const btc = await ethers.getContractAt('IERC20', btcAddress);
  const musd = await ethers.getContractAt('IERC20', musdAddress);

  console.log('\n🔍 DEBUGGING DEPOSIT ISSUE\n');

  // Check strategy setup
  console.log('Strategy Setup:');
  const vaultController = await strategy.vaultController();
  const harvester = await strategy.harvester();
  console.log('  VaultController set:', vaultController === vaultAddress);
  console.log('  VaultController:', vaultController);
  console.log('  Harvester:', harvester);

  // Check vault setup
  console.log('\nVault Setup:');
  const strategyInVault = await vault.strategy();
  console.log('  Strategy set:', strategyInVault === strategyAddress);
  console.log('  Strategy:', strategyInVault);

  // Check balances
  console.log('\nContract Balances:');
  const strategyMusdBalance = await musd.balanceOf(strategyAddress);
  const strategyBtcBalance = await btc.balanceOf(strategyAddress);
  console.log('  StrategyBTC MUSD:', ethers.formatEther(strategyMusdBalance));
  console.log('  StrategyBTC BTC:', ethers.formatEther(strategyBtcBalance));

  // Check pool
  console.log('\nPool Info:');
  const pool = await ethers.getContractAt('ITigrisPool', poolAddress);
  const token0 = await pool.token0();
  const token1 = await pool.token1();
  const [reserve0, reserve1] = await pool.getReserves();

  console.log('  Token0:', token0);
  console.log('  Token1:', token1);
  console.log('  Reserve0:', ethers.formatEther(reserve0));
  console.log('  Reserve1:', ethers.formatEther(reserve1));
  console.log(
    '  BTC is token0:',
    token0.toLowerCase() === btcAddress.toLowerCase()
  );
  console.log(
    '  MUSD is token0:',
    token0.toLowerCase() === musdAddress.toLowerCase()
  );

  // Calculate MUSD needed for 0.0001 BTC
  const depositAmount = ethers.parseEther('0.0001');
  let musdNeeded;

  if (token0.toLowerCase() === musdAddress.toLowerCase()) {
    musdNeeded = (depositAmount * BigInt(reserve0)) / BigInt(reserve1);
    console.log('\n  MUSD is token0, BTC is token1');
  } else {
    musdNeeded = (depositAmount * BigInt(reserve1)) / BigInt(reserve0);
    console.log('\n  BTC is token0, MUSD is token1');
  }

  console.log(
    '  MUSD needed for',
    ethers.formatEther(depositAmount),
    'BTC:',
    ethers.formatEther(musdNeeded)
  );
  console.log('  Have enough MUSD:', strategyMusdBalance >= musdNeeded);

  // Check approvals
  console.log('\nApprovals:');
  const routerAddress = '0x9a1ff7FE3a0F69959A3fBa1F1e5ee18e1A9CD7E9';
  const btcAllowance = await btc.allowance(strategyAddress, routerAddress);
  const musdAllowance = await musd.allowance(strategyAddress, routerAddress);
  console.log(
    '  Strategy->Router BTC allowance:',
    ethers.formatEther(btcAllowance)
  );
  console.log(
    '  Strategy->Router MUSD allowance:',
    ethers.formatEther(musdAllowance)
  );

  const vaultToStrategyAllowance = await btc.allowance(
    vaultAddress,
    strategyAddress
  );
  console.log(
    '  VaultController->Strategy BTC allowance:',
    ethers.formatEther(vaultToStrategyAllowance)
  );
  console.log('  Is MAX:', vaultToStrategyAllowance === ethers.MaxUint256);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
