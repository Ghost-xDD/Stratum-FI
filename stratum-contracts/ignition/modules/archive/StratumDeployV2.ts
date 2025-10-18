import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

/**
 * Stratum Fi V2 Deployment - With Mock Secondary Pool
 */

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

export default buildModule('StratumFiV2', (m) => {
  const tigrisRouter = m.getParameter('tigrisRouter', MEZO_TESTNET_CONFIG.TIGRIS_ROUTER);
  const musdBtcPool = m.getParameter('musdBtcPool', MEZO_TESTNET_CONFIG.MUSD_BTC_POOL);
  const btc = m.getParameter('btc', MEZO_TESTNET_CONFIG.BTC);
  const musd = m.getParameter('musd', MEZO_TESTNET_CONFIG.MUSD);
  const musdc = m.getParameter('musdc', MEZO_TESTNET_CONFIG.MUSDC);
  const pythOracle = m.getParameter('pythOracle', MEZO_TESTNET_CONFIG.PYTH_ORACLE);
  const btcPriceFeedId = m.getParameter('btcPriceFeedId', MEZO_TESTNET_CONFIG.BTC_PRICE_FEED_ID);

  // Deploy bMUSD
  const bmusd = m.contract('bMUSD', []);

  // Deploy DebtManager
  const debtManager = m.contract('DebtManager', [bmusd, pythOracle, btcPriceFeedId]);

  // Deploy StrategyBTC
  const strategy = m.contract('StrategyBTC', [btc, musd, tigrisRouter, musdBtcPool]);

  // Deploy VaultController
  const vaultController = m.contract('VaultController', [btc]);

  // Deploy Harvester
  const harvester = m.contract('Harvester', [tigrisRouter, musd, btc]);

  // Deploy MockTigrisSwap
  const mockSwap = m.contract('MockTigrisSwap', [bmusd, musd]);

  // Deploy MockMUSDCPool (NEW!)
  const mockPool = m.contract('MockMUSDCPool', [musd, musdc]);

  // Deploy TurboLoopV2 (uses mock pool)
  const turboLoop = m.contract('TurboLoopV2', [bmusd, musd]);

  // Setup relationships
  m.call(bmusd, 'setDebtManager', [debtManager]);
  m.call(debtManager, 'setStrategy', [strategy]);
  m.call(strategy, 'setVaultController', [vaultController]);
  m.call(strategy, 'setHarvester', [harvester]);
  m.call(vaultController, 'setStrategy', [strategy]);
  m.call(vaultController, 'setDebtManager', [debtManager]);
  m.call(harvester, 'setStrategy', [strategy]);
  m.call(harvester, 'setDebtManager', [debtManager]);
  m.call(turboLoop, 'setMockSwap', [mockSwap]);
  m.call(turboLoop, 'setMockPool', [mockPool]);

  return {
    bmusd,
    debtManager,
    strategy,
    vaultController,
    harvester,
    mockSwap,
    mockPool,
    turboLoop,
  };
});

