import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

/**
 * Stratum Fi Final Deployment - Fully On-Chain (No Mocks!)
 * Uses real bMUSD/MUSD pool on Tigris
 */

const MEZO_TESTNET_CONFIG = {
  TIGRIS_ROUTER: '0x9a1ff7FE3a0F69959A3fBa1F1e5ee18e1A9CD7E9',
  FACTORY: '0x4947243CC818b627A5D06d14C4eCe7398A23Ce1A',
  MUSD_BTC_POOL: '0xd16A5Df82120ED8D626a1a15232bFcE2366d6AA9',
  BMUSD_MUSD_POOL: '0xBE911Dc9f7634406547D1453e97E631AA954b89a', // Pre-created pool
  BTC: '0x7b7C000000000000000000000000000000000000',
  MUSD: '0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503',
  PYTH_ORACLE: '0x2880aB155794e7179c9eE2e38200202908C17B43',
  BTC_PRICE_FEED_ID:
    '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
};

export default buildModule('StratumFiFinal', (m) => {
  const tigrisRouter = m.getParameter(
    'tigrisRouter',
    MEZO_TESTNET_CONFIG.TIGRIS_ROUTER
  );
  const factory = m.getParameter('factory', MEZO_TESTNET_CONFIG.FACTORY);
  const musdBtcPool = m.getParameter(
    'musdBtcPool',
    MEZO_TESTNET_CONFIG.MUSD_BTC_POOL
  );
  const bmusdMusdPool = m.getParameter(
    'bmusdMusdPool',
    MEZO_TESTNET_CONFIG.BMUSD_MUSD_POOL
  );
  const btc = m.getParameter('btc', MEZO_TESTNET_CONFIG.BTC);
  const musd = m.getParameter('musd', MEZO_TESTNET_CONFIG.MUSD);
  const pythOracle = m.getParameter(
    'pythOracle',
    MEZO_TESTNET_CONFIG.PYTH_ORACLE
  );
  const btcPriceFeedId = m.getParameter(
    'btcPriceFeedId',
    MEZO_TESTNET_CONFIG.BTC_PRICE_FEED_ID
  );

  // ============================================================
  // PHASE 1: Core Token Contracts
  // ============================================================

  const bmusd = m.contract('bMUSD', []);
  const debtManager = m.contract('DebtManager', [
    bmusd,
    pythOracle,
    btcPriceFeedId,
  ]);

  // ============================================================
  // PHASE 2: Strategy and Vault
  // ============================================================

  const strategy = m.contract('StrategyBTC', [
    btc,
    musd,
    tigrisRouter,
    musdBtcPool,
  ]);
  const vaultController = m.contract('VaultController', [btc]);

  // ============================================================
  // PHASE 3: Yield and Loop (NO MORE MOCKS!)
  // ============================================================

  const harvester = m.contract('Harvester', [tigrisRouter, musd, btc]);

  // TurboLoopReal with factory (pool set after deployment)
  const turboLoop = m.contract('TurboLoopReal', [
    bmusd,
    musd,
    tigrisRouter,
    factory,
  ]);

  // ============================================================
  // PHASE 4: Setup Relationships
  // ============================================================

  m.call(bmusd, 'setDebtManager', [debtManager]);
  m.call(debtManager, 'setStrategy', [strategy]);
  m.call(strategy, 'setVaultController', [vaultController]);
  m.call(strategy, 'setHarvester', [harvester]);
  m.call(vaultController, 'setStrategy', [strategy]);
  m.call(vaultController, 'setDebtManager', [debtManager]);
  m.call(harvester, 'setStrategy', [strategy]);
  m.call(harvester, 'setDebtManager', [debtManager]);

  // Set the pre-created bMUSD/MUSD pool in TurboLoop
  m.call(turboLoop, 'setPool', [bmusdMusdPool]);

  return {
    bmusd,
    debtManager,
    strategy,
    vaultController,
    harvester,
    turboLoop,
  };
});
