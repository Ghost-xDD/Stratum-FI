import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

/**
 * Stratum Fi Deployment Module using Hardhat Ignition
 *
 * This module deploys all Stratum Fi contracts and sets up their relationships
 * in a declarative, resumable way.
 */

// Configuration based on network
const MEZO_MAINNET_CONFIG = {
  TIGRIS_ROUTER: '0x16A76d3cd3C1e3CE843C6680d6B37E9116b5C706',
  MUSD_BTC_POOL: '0x52e604c44417233b6CcEDDDc0d640A405Caacefb',
  MUSD_MUSDC_POOL: '0xEd812AEc0Fecc8fD882Ac3eccC43f3aA80A6c356',
  BTC: '0x...', // TODO: Add actual BTC token address
  MUSD: '0x...', // TODO: Add actual MUSD token address
  MUSDC: '0x...', // TODO: Add actual mUSDC token address
  PYTH_ORACLE: '0x...', // TODO: Add actual Pyth oracle address
  BTC_PRICE_FEED_ID:
    '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
};

const MEZO_TESTNET_CONFIG = {
  TIGRIS_ROUTER: '0x9a1ff7FE3a0F69959A3fBa1F1e5ee18e1A9CD7E9',
  MUSD_BTC_POOL: '0xd16A5Df82120ED8D626a1a15232bFcE2366d6AA9',
  MUSD_MUSDC_POOL: '0x525F049A4494dA0a6c87E3C4df55f9929765Dc3e',
  BTC: '0x7b7C000000000000000000000000000000000000',
  MUSD: '0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503',
  MUSDC: '0xe1a26db653708A2AD8F824E92Db9852410e33A59',
  PYTH_ORACLE: '0x2880aB155794e7179c9eE2e38200202908C17B43',
  BTC_PRICE_FEED_ID:
    '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
};

export default buildModule('StratumFi', (m) => {
  // Get network-specific config parameters
  // These can be overridden with --parameters flag
  const tigrisRouter = m.getParameter(
    'tigrisRouter',
    MEZO_TESTNET_CONFIG.TIGRIS_ROUTER
  );
  const musdBtcPool = m.getParameter(
    'musdBtcPool',
    MEZO_TESTNET_CONFIG.MUSD_BTC_POOL
  );
  const musdMusdcPool = m.getParameter(
    'musdMusdcPool',
    MEZO_TESTNET_CONFIG.MUSD_MUSDC_POOL
  );
  const btc = m.getParameter('btc', MEZO_TESTNET_CONFIG.BTC);
  const musd = m.getParameter('musd', MEZO_TESTNET_CONFIG.MUSD);
  const musdc = m.getParameter('musdc', MEZO_TESTNET_CONFIG.MUSDC);
  const pythOracle = m.getParameter(
    'pythOracle',
    MEZO_TESTNET_CONFIG.PYTH_ORACLE
  );
  const btcPriceFeedId = m.getParameter(
    'btcPriceFeedId',
    MEZO_TESTNET_CONFIG.BTC_PRICE_FEED_ID
  );

  // ============================================================
  // PHASE 1: Deploy Core Token Contracts
  // ============================================================

  // Deploy bMUSD (no constructor args)
  const bmusd = m.contract('bMUSD', []);

  // Deploy DebtManager
  const debtManager = m.contract('DebtManager', [
    bmusd,
    pythOracle,
    btcPriceFeedId,
  ]);

  // ============================================================
  // PHASE 2: Deploy Strategy and Vault
  // ============================================================

  // Deploy StrategyBTC
  const strategy = m.contract('StrategyBTC', [
    btc,
    musd,
    tigrisRouter,
    musdBtcPool,
  ]);

  // Deploy VaultController
  const vaultController = m.contract('VaultController', [btc]);

  // ============================================================
  // PHASE 3: Deploy Yield and Loop Contracts
  // ============================================================

  // Deploy Harvester
  const harvester = m.contract('Harvester', [tigrisRouter, musd, btc]);

  // Deploy MockTigrisSwap
  const mockSwap = m.contract('MockTigrisSwap', [bmusd, musd]);

  // Deploy TurboLoop
  const turboLoop = m.contract('TurboLoop', [bmusd, musd, musdc, tigrisRouter]);

  // ============================================================
  // PHASE 4: Setup Contract Relationships
  // ============================================================

  // Set DebtManager in bMUSD
  m.call(bmusd, 'setDebtManager', [debtManager]);

  // Set Strategy in DebtManager
  m.call(debtManager, 'setStrategy', [strategy]);

  // Set VaultController in Strategy
  m.call(strategy, 'setVaultController', [vaultController]);

  // Set Harvester in Strategy
  m.call(strategy, 'setHarvester', [harvester]);

  // Set Strategy in VaultController
  m.call(vaultController, 'setStrategy', [strategy]);

  // Set DebtManager in VaultController
  m.call(vaultController, 'setDebtManager', [debtManager]);

  // Set Strategy in Harvester
  m.call(harvester, 'setStrategy', [strategy]);

  // Set DebtManager in Harvester
  m.call(harvester, 'setDebtManager', [debtManager]);

  // Set DebtManager in TurboLoop
  m.call(turboLoop, 'setDebtManager', [debtManager]);

  // Set MockSwap in TurboLoop
  m.call(turboLoop, 'setMockSwap', [mockSwap]);

  // ============================================================
  // Return all deployed contracts
  // ============================================================

  return {
    bmusd,
    debtManager,
    strategy,
    vaultController,
    harvester,
    mockSwap,
    turboLoop,
  };
});
