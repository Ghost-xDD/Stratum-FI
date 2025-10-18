import { ethers } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Post-deployment setup:
 * 1. Create bMUSD/MUSD pool on Tigris
 * 2. Set pool in TurboLoopReal
 * 3. Bootstrap pool with initial liquidity
 */
async function main() {
  const [deployer] = await ethers.getSigners();

  // Load deployed addresses
  const deploymentsPath = path.join(
    __dirname,
    '../ignition/deployments/chain-31611/deployed_addresses.json'
  );
  const deployedAddresses = JSON.parse(
    fs.readFileSync(deploymentsPath, 'utf-8')
  );

  const factoryAddress = '0x4947243CC818b627A5D06d14C4eCe7398A23Ce1A';
  const bmusdAddress = deployedAddresses['StratumFiFinal#bMUSD'];
  const musdAddress = '0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503';
  const turboLoopAddress = deployedAddresses['StratumFiFinal#TurboLoopReal'];
  const routerAddress = '0x9a1ff7FE3a0F69959A3fBa1F1e5ee18e1A9CD7E9';

  console.log('\n🚀 POST-DEPLOYMENT SETUP\n');
  console.log('Factory:', factoryAddress);
  console.log('bMUSD:', bmusdAddress);
  console.log('TurboLoop:', turboLoopAddress);

  // Step 1: Create bMUSD/MUSD pool (or get existing)
  console.log('\n1️⃣ Getting/Creating bMUSD/MUSD pool...');

  const factory = new ethers.Contract(
    factoryAddress,
    [
      'function createPool(address tokenA, address tokenB, bool stable) returns (address pool)',
    ],
    deployer
  );

  const factoryWithGet = new ethers.Contract(
    factoryAddress,
    [
      'function createPool(address tokenA, address tokenB, bool stable) returns (address pool)',
      'function getPool(address tokenA, address tokenB, bool stable) view returns (address pool)',
    ],
    deployer
  );

  let poolAddress;

  try {
    // First check if pool exists
    poolAddress = await factoryWithGet.getPool(bmusdAddress, musdAddress, true);

    if (poolAddress === ethers.ZeroAddress) {
      // Pool doesn't exist, create it
      console.log('Pool not found, creating new one...');
      const createTx = await factory.createPool(
        bmusdAddress,
        musdAddress,
        true
      );
      const receipt = await createTx.wait();
      poolAddress = await factoryWithGet.getPool(
        bmusdAddress,
        musdAddress,
        true
      );
      console.log('✅ Pool created! Tx:', receipt?.hash);
    } else {
      console.log('✅ Pool already exists!');
    }

    console.log('Pool address:', poolAddress);

    // Step 2: Set pool in TurboLoopReal
    console.log('\n2️⃣ Setting pool in TurboLoopReal...');
    const turboLoop = await ethers.getContractAt(
      'TurboLoopReal',
      turboLoopAddress
    );
    const setPoolTx = await turboLoop.setPool(poolAddress);
    await setPoolTx.wait();
    console.log('✅ Pool set in TurboLoop');

    // Step 3: Bootstrap pool with liquidity
    console.log('\n3️⃣ Bootstrapping pool with initial liquidity...');

    const router = await ethers.getContractAt('ITigrisRouter', routerAddress);
    const bmusd = await ethers.getContractAt('IERC20', bmusdAddress);
    const musd = await ethers.getContractAt('IERC20', musdAddress);

    const bmusdAmount = ethers.parseEther('10');
    const musdAmount = ethers.parseEther('10');

    console.log(
      'Adding:',
      ethers.formatEther(bmusdAmount),
      'bMUSD +',
      ethers.formatEther(musdAmount),
      'MUSD'
    );

    // Check balances
    const bmusdBal = await bmusd.balanceOf(deployer.address);
    const musdBal = await musd.balanceOf(deployer.address);

    console.log('Your bMUSD:', ethers.formatEther(bmusdBal));
    console.log('Your MUSD:', ethers.formatEther(musdBal));

    if (bmusdBal < bmusdAmount) {
      console.log('\n⚠️  Need to mint bMUSD first (only DebtManager can mint)');
      console.log('Skipping bootstrap - you can add liquidity manually later');
    } else {
      // Approve
      let tx = await bmusd.approve(routerAddress, bmusdAmount);
      await tx.wait();
      tx = await musd.approve(routerAddress, musdAmount);
      await tx.wait();

      // Add liquidity
      tx = await router.addLiquidity(
        bmusdAddress,
        musdAddress,
        true,
        bmusdAmount,
        musdAmount,
        0,
        0,
        deployer.address,
        Math.floor(Date.now() / 1000) + 600
      );
      await tx.wait();
      console.log('✅ Pool bootstrapped with liquidity!');
    }

    // Save pool address
    const updatedDeployment = {
      ...deployedAddresses,
      'StratumFiFinal#bMUSDMUSDPool': poolAddress,
    };
    fs.writeFileSync(
      deploymentsPath,
      JSON.stringify(updatedDeployment, null, 2)
    );

    console.log('\n✅ POST-DEPLOYMENT COMPLETE!');
    console.log('\n📋 Summary:');
    console.log('bMUSD/MUSD Pool:', poolAddress);
    console.log('TurboLoop configured:', turboLoopAddress);
  } catch (error: any) {
    if (
      error.message.includes('PoolAlreadyExists') ||
      error.message.includes('POOL_EXISTS')
    ) {
      console.log('⚠️  Pool already exists - finding existing pool...');

      // Pool already exists, just get its address
      const poolAddress = await factory.createPool.staticCall(
        bmusdAddress,
        musdAddress,
        true
      );
      console.log('Existing pool:', poolAddress);

      // Set it in TurboLoop
      const turboLoop = await ethers.getContractAt(
        'TurboLoopReal',
        turboLoopAddress
      );
      const setPoolTx = await turboLoop.setPool(poolAddress);
      await setPoolTx.wait();
      console.log('✅ Pool set in TurboLoop');

      // Save
      const updatedDeployment = {
        ...deployedAddresses,
        'StratumFiFinal#bMUSDMUSDPool': poolAddress,
      };
      fs.writeFileSync(
        deploymentsPath,
        JSON.stringify(updatedDeployment, null, 2)
      );
    } else {
      console.error('❌ Error:', error.message);
      throw error;
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
