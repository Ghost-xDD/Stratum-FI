import { ethers } from 'hardhat';
import * as deployedAddresses from '../ignition/deployments/chain-31611/deployed_addresses.json';

/**
 * Bootstrap the bMUSD/MUSD pool with initial liquidity
 */
async function main() {
  const [user] = await ethers.getSigners();
  
  const routerAddress = '0x9a1ff7FE3a0F69959A3fBa1F1e5ee18e1A9CD7E9';
  const poolAddress = '0x0620E7b05cd18C3ef21DD96b47776de7799b061a'; // Created pool
  const bmusdAddress = deployedAddresses['StratumFi#bMUSD'];
  const musdAddress = '0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503';
  
  console.log('\n💧 BOOTSTRAPPING bMUSD/MUSD POOL\n');
  console.log('Pool:', poolAddress);
  
  const router = await ethers.getContractAt('ITigrisRouter', routerAddress);
  const bmusd = await ethers.getContractAt('IERC20', bmusdAddress);
  const musd = await ethers.getContractAt('IERC20', musdAddress);
  
  // Check balances
  const bmusdBalance = await bmusd.balanceOf(user.address);
  const musdBalance = await musd.balanceOf(user.address);
  
  console.log('Your balances:');
  console.log('  bMUSD:', ethers.formatEther(bmusdBalance));
  console.log('  MUSD:', ethers.formatEther(musdBalance));
  
  // Bootstrap amounts (start small for testing)
  const bmusdAmount = ethers.parseEther('5'); // 5 bMUSD
  const musdAmount = ethers.parseEther('5');  // 5 MUSD (1:1 ratio)
  
  console.log('\nBootstrap amounts:');
  console.log('  bMUSD:', ethers.formatEther(bmusdAmount));
  console.log('  MUSD:', ethers.formatEther(musdAmount));
  
  if (bmusdBalance < bmusdAmount || musdBalance < musdAmount) {
    console.error('\n❌ Insufficient balance');
    return;
  }
  
  // Approve
  console.log('\n1️⃣ Approving tokens...');
  let tx = await bmusd.approve(routerAddress, ethers.MaxUint256);
  await tx.wait();
  tx = await musd.approve(routerAddress, ethers.MaxUint256);
  await tx.wait();
  console.log('✅ Approved');
  
  // Add liquidity
  console.log('\n2️⃣ Adding liquidity to bMUSD/MUSD pool...');
  try {
    tx = await router.addLiquidity(
      bmusdAddress,
      musdAddress,
      true, // stable pair (1:1 peg)
      bmusdAmount,
      musdAmount,
      0,
      0,
      user.address,
      Math.floor(Date.now() / 1000) + 600
    );
    
    console.log('Tx hash:', tx.hash);
    const receipt = await tx.wait();
    console.log('✅ Liquidity added! Block:', receipt?.blockNumber);
    
    // Check LP tokens
    const pool = await ethers.getContractAt('ITigrisPool', poolAddress);
    const lpBalance = await pool.balanceOf(user.address);
    console.log('\n💎 Your LP tokens:', ethers.formatEther(lpBalance));
    
    console.log('\n🎉 bMUSD/MUSD POOL IS NOW LIVE!');
    console.log('Pool address:', poolAddress);
    console.log('\n✅ TurboLoop can now use real Tigris pools!');
    
  } catch (e: any) {
    console.log('❌ Failed:', e.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

