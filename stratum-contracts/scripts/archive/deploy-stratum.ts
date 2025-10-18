import { ethers } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Deployment script for Stratum Fi protocol
 *
 * This script deploys all contracts in the correct order and sets up relationships
 */

// Mezo Mainnet Addresses
const MEZO_MAINNET = {
  TIGRIS_ROUTER: '0x16A76d3cd3C1e3CE843C6680d6B37E9116b5C706',
  MUSD_BTC_POOL: '0x52e604c44417233b6CcEDDDc0d640A405Caacefb',
  MUSD_MUSDC_POOL: '0xEd812AEc0Fecc8fD882Ac3eccC43f3aA80A6c356',
  BTC: '0x...', // Add actual BTC token address
  MUSD: '0x...', // Add actual MUSD token address
  MUSDC: '0x...', // Add actual mUSDC token address
  PYTH_ORACLE: '0x...', // Add actual Pyth oracle address
  BTC_PRICE_FEED_ID:
    '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43', // BTC/USD price feed
};

// Mezo Testnet Addresses
const MEZO_TESTNET = {
  TIGRIS_ROUTER: '0x9a1ff7FE3a0F69959A3fBa1F1e5ee18e1A9CD7E9',
  MUSD_BTC_POOL: '0xd16A5Df82120ED8D626a1a15232bFcE2366d6AA9',
  MUSD_MUSDC_POOL: '0x525F049A4494dA0a6c87E3C4df55f9929765Dc3e',
  BTC: '0x7b7C000000000000000000000000000000000000', // Add actual BTC token address
  MUSD: '0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503', // Add actual MUSD token address
  MUSDC: '0xe1a26db653708A2AD8F824E92Db9852410e33A59', // Add actual mUSDC token address
  PYTH_ORACLE: '0x2880aB155794e7179c9eE2e38200202908C17B43', // Add actual Pyth oracle address
  BTC_PRICE_FEED_ID:
    '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
};

async function main() {
  console.log('🚀 Starting Stratum Fi deployment...\n');

  // Get network
  const network = await ethers.provider.getNetwork();
  const isTestnet = network.chainId === BigInt(7701);
  const config = isTestnet ? MEZO_TESTNET : MEZO_MAINNET;

  console.log(`Network: ${isTestnet ? 'Mezo Testnet' : 'Mezo Mainnet'}`);
  console.log(`Chain ID: ${network.chainId}\n`);

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer address: ${deployer.address}`);
  console.log(
    `Deployer balance: ${ethers.formatEther(
      await ethers.provider.getBalance(deployer.address)
    )} ETH\n`
  );

  // Deploy bMUSD
  console.log('📝 Deploying bMUSD...');
  const bMUSD = await ethers.deployContract('bMUSD', []);
  await bMUSD.waitForDeployment();
  const bmusdAddress = await bMUSD.getAddress();
  console.log(`✅ bMUSD deployed at: ${bmusdAddress}\n`);

  // Deploy DebtManager
  console.log('📝 Deploying DebtManager...');
  const DebtManager = await ethers.deployContract('DebtManager', [
    bmusdAddress,
    config.PYTH_ORACLE,
    config.BTC_PRICE_FEED_ID,
  ]);
  await DebtManager.waitForDeployment();
  const debtManagerAddress = await DebtManager.getAddress();
  console.log(`✅ DebtManager deployed at: ${debtManagerAddress}\n`);

  // Set DebtManager in bMUSD
  console.log('🔗 Setting DebtManager in bMUSD...');
  const setDebtManagerTx = await bMUSD.setDebtManager(debtManagerAddress);
  await setDebtManagerTx.wait();
  console.log('✅ DebtManager set in bMUSD\n');

  // Deploy StrategyBTC
  console.log('📝 Deploying StrategyBTC...');
  const StrategyBTC = await ethers.deployContract('StrategyBTC', [
    config.BTC,
    config.MUSD,
    config.TIGRIS_ROUTER,
    config.MUSD_BTC_POOL,
  ]);
  await StrategyBTC.waitForDeployment();
  const strategyAddress = await StrategyBTC.getAddress();
  console.log(`✅ StrategyBTC deployed at: ${strategyAddress}\n`);

  // Deploy VaultController
  console.log('📝 Deploying VaultController...');
  const VaultController = await ethers.deployContract('VaultController', [
    config.BTC,
  ]);
  await VaultController.waitForDeployment();
  const vaultAddress = await VaultController.getAddress();
  console.log(`✅ VaultController deployed at: ${vaultAddress}\n`);

  // Deploy Harvester
  console.log('📝 Deploying Harvester...');
  const Harvester = await ethers.deployContract('Harvester', [
    config.TIGRIS_ROUTER,
    config.MUSD,
    config.BTC,
  ]);
  await Harvester.waitForDeployment();
  const harvesterAddress = await Harvester.getAddress();
  console.log(`✅ Harvester deployed at: ${harvesterAddress}\n`);

  // Deploy MockTigrisSwap
  console.log('📝 Deploying MockTigrisSwap...');
  const MockTigrisSwap = await ethers.deployContract('MockTigrisSwap', [
    bmusdAddress,
    config.MUSD,
  ]);
  await MockTigrisSwap.waitForDeployment();
  const mockSwapAddress = await MockTigrisSwap.getAddress();
  console.log(`✅ MockTigrisSwap deployed at: ${mockSwapAddress}\n`);

  // Deploy TurboLoop
  console.log('📝 Deploying TurboLoop...');
  const TurboLoop = await ethers.deployContract('TurboLoop', [
    bmusdAddress,
    config.MUSD,
    config.MUSDC,
    config.TIGRIS_ROUTER,
  ]);
  await TurboLoop.waitForDeployment();
  const turboLoopAddress = await TurboLoop.getAddress();
  console.log(`✅ TurboLoop deployed at: ${turboLoopAddress}\n`);

  // Setup contract relationships
  console.log('🔗 Setting up contract relationships...\n');

  // Set Strategy in DebtManager
  console.log('Setting strategy in DebtManager...');
  const setStrategyTx = await DebtManager.setStrategy(strategyAddress);
  await setStrategyTx.wait();
  console.log('✅ Strategy set\n');

  // Set VaultController in Strategy
  console.log('Setting VaultController in Strategy...');
  const setVaultTx = await StrategyBTC.setVaultController(vaultAddress);
  await setVaultTx.wait();
  console.log('✅ VaultController set\n');

  // Set Harvester in Strategy
  console.log('Setting Harvester in Strategy...');
  const setHarvesterTx = await StrategyBTC.setHarvester(harvesterAddress);
  await setHarvesterTx.wait();
  console.log('✅ Harvester set\n');

  // Set Strategy in VaultController
  console.log('Setting Strategy in VaultController...');
  const setStrategyInVaultTx = await VaultController.setStrategy(
    strategyAddress
  );
  await setStrategyInVaultTx.wait();
  console.log('✅ Strategy set in VaultController\n');

  // Set DebtManager in VaultController
  console.log('Setting DebtManager in VaultController...');
  const setDebtManagerInVaultTx = await VaultController.setDebtManager(
    debtManagerAddress
  );
  await setDebtManagerInVaultTx.wait();
  console.log('✅ DebtManager set in VaultController\n');

  // Set Strategy in Harvester
  console.log('Setting Strategy in Harvester...');
  const setStrategyInHarvesterTx = await Harvester.setStrategy(strategyAddress);
  await setStrategyInHarvesterTx.wait();
  console.log('✅ Strategy set in Harvester\n');

  // Set DebtManager in Harvester
  console.log('Setting DebtManager in Harvester...');
  const setDebtManagerInHarvesterTx = await Harvester.setDebtManager(
    debtManagerAddress
  );
  await setDebtManagerInHarvesterTx.wait();
  console.log('✅ DebtManager set in Harvester\n');

  // Set DebtManager in TurboLoop
  console.log('Setting DebtManager in TurboLoop...');
  const setDebtManagerInTurboTx = await TurboLoop.setDebtManager(
    debtManagerAddress
  );
  await setDebtManagerInTurboTx.wait();
  console.log('✅ DebtManager set in TurboLoop\n');

  // Set MockSwap in TurboLoop
  console.log('Setting MockSwap in TurboLoop...');
  const setMockSwapTx = await TurboLoop.setMockSwap(mockSwapAddress);
  await setMockSwapTx.wait();
  console.log('✅ MockSwap set in TurboLoop\n');

  // Save deployment info
  const deploymentInfo = {
    network: isTestnet ? 'mezo-testnet' : 'mezo-mainnet',
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      bMUSD: bmusdAddress,
      DebtManager: debtManagerAddress,
      StrategyBTC: strategyAddress,
      VaultController: vaultAddress,
      Harvester: harvesterAddress,
      MockTigrisSwap: mockSwapAddress,
      TurboLoop: turboLoopAddress,
    },
    config,
  };

  const deploymentPath = path.join(__dirname, '..', 'deployments.json');
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

  console.log('✅ Deployment complete!\n');
  console.log('📋 Deployment Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`bMUSD:            ${bmusdAddress}`);
  console.log(`DebtManager:      ${debtManagerAddress}`);
  console.log(`StrategyBTC:      ${strategyAddress}`);
  console.log(`VaultController:  ${vaultAddress}`);
  console.log(`Harvester:        ${harvesterAddress}`);
  console.log(`MockTigrisSwap:   ${mockSwapAddress}`);
  console.log(`TurboLoop:        ${turboLoopAddress}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('⚠️  IMPORTANT NEXT STEPS:');
  console.log('1. Fund StrategyBTC with MUSD:');
  console.log(`   - Mint MUSD at mezo.org`);
  console.log(`   - Transfer to: ${strategyAddress}`);
  console.log('2. Fund MockTigrisSwap with MUSD:');
  console.log(`   - Transfer MUSD to: ${mockSwapAddress}`);
  console.log('3. Set keeper address in Harvester (optional)');
  console.log('4. Verify contracts on block explorer\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
