import { ethers } from 'hardhat';
import * as deployedAddresses from '../../ignition/deployments/chain-31611/deployed_addresses.json';

/**
 * Add liquidity to bMUSD/MUSD pool
 */
async function main() {
  const [user] = await ethers.getSigners();

  // Addresses
  const routerAddress = '0x9a1ff7FE3a0F69959A3fBa1F1e5ee18e1A9CD7E9';
  const poolAddress =
    deployedAddresses['StratumFiFinal#bMUSDMUSDPool'] ||
    '0xBE911Dc9f7634406547D1453e97E631AA954b89a';
  const bmusdAddress = deployedAddresses['StratumFiFinal#bMUSD'];
  const musdAddress = '0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503';

  console.log('\n💧 ADDING LIQUIDITY TO bMUSD/MUSD POOL\n');
  console.log('Pool:', poolAddress);

  // Get contracts
  const router = await ethers.getContractAt('ITigrisRouter', routerAddress);
  const pool = await ethers.getContractAt('ITigrisPool', poolAddress);
  const bmusd = await ethers.getContractAt('IERC20', bmusdAddress);
  const musd = await ethers.getContractAt('IERC20', musdAddress);

  // Check balances
  const bmusdBalance = await bmusd.balanceOf(user.address);
  const musdBalance = await musd.balanceOf(user.address);

  console.log('💰 Your Balances:');
  console.log('bMUSD:', ethers.formatEther(bmusdBalance));
  console.log('MUSD:', ethers.formatEther(musdBalance));

  // Define amounts (1:1 ratio for stable pair)
  const amount = ethers.parseEther('10'); // 10 of each

  console.log('\n📝 Adding:');
  console.log('bMUSD:', ethers.formatEther(amount));
  console.log('MUSD:', ethers.formatEther(amount));

  if (bmusdBalance < amount || musdBalance < amount) {
    console.error('\n❌ Insufficient balance');
    console.log('Need:', ethers.formatEther(amount), 'of each');
    return;
  }

  // Approvals
  console.log('\n1️⃣ Approve bMUSD');
  let tx = await bmusd.approve(routerAddress, ethers.MaxUint256);
  await tx.wait();
  console.log('✅ Approved');

  console.log('\n2️⃣ Approve MUSD');
  tx = await musd.approve(routerAddress, ethers.MaxUint256);
  await tx.wait();
  console.log('✅ Approved');

  // Add liquidity
  console.log('\n3️⃣ Adding liquidity to bMUSD/MUSD pool...');
  console.log('⭐ Using stable=true (stablecoin pair)');

  try {
    tx = await router.addLiquidity(
      bmusdAddress, // tokenA
      musdAddress, // tokenB
      true, // stable (both pegged 1:1)
      amount, // amountADesired
      amount, // amountBDesired
      0, // amountAMin
      0, // amountBMin
      user.address, // to
      Math.floor(Date.now() / 1000) + 600 // deadline
    );

    console.log('Transaction hash:', tx.hash);
    const receipt = await tx.wait();
    console.log('✅ SUCCESS! Block:', receipt?.blockNumber);

    // Check LP balance
    const lpBalance = await pool.balanceOf(user.address);
    console.log('\n4️⃣ Receive LP');
    console.log('LP tokens:', ethers.formatEther(lpBalance));
    console.log('🎉 Start earning swap fees!');
  } catch (error: any) {
    console.log('❌ FAILED');
    console.log('Error:', error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
