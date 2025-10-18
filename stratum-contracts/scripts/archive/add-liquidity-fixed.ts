import { ethers } from 'hardhat';

/**
 * Add liquidity to Tigris MUSD/BTC pool
 * Fixed version matching Mezo UI flow
 */
async function main() {
  const [user] = await ethers.getSigners();

  // Addresses
  const routerAddress = '0x9a1ff7FE3a0F69959A3fBa1F1e5ee18e1A9CD7E9';
  const poolAddress = '0xd16A5Df82120ED8D626a1a15232bFcE2366d6AA9';
  const btcAddress = '0x7b7C000000000000000000000000000000000000';
  const musdAddress = '0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503';

  console.log('\n💧 ADDING LIQUIDITY TO MUSD/BTC POOL\n');
  console.log('User:', user.address);

  // Get contracts
  const router = await ethers.getContractAt('ITigrisRouter', routerAddress);
  const pool = await ethers.getContractAt('ITigrisPool', poolAddress);
  const btc = await ethers.getContractAt('IERC20', btcAddress);
  const musd = await ethers.getContractAt('IERC20', musdAddress);

  // Get pool info - CRITICAL: Use token order from pool
  const token0 = await pool.token0();
  const token1 = await pool.token1();
  const [reserve0, reserve1] = await pool.getReserves();

  console.log('\n📊 Pool Configuration:');
  console.log('Token0:', token0);
  console.log('Token1:', token1);
  console.log('Reserve0:', ethers.formatEther(reserve0));
  console.log('Reserve1:', ethers.formatEther(reserve1));

  // Check which token is which
  const isMusdToken0 = token0.toLowerCase() === musdAddress.toLowerCase();
  console.log('\nMUSD is token0:', isMusdToken0);
  console.log('BTC is token1:', !isMusdToken0);

  // Check balances
  const btcBalance = await btc.balanceOf(user.address);
  const musdBalance = await musd.balanceOf(user.address);

  console.log('\n💰 Your Balances:');
  console.log('BTC:', ethers.formatEther(btcBalance));
  console.log('MUSD:', ethers.formatEther(musdBalance));

  // Define amounts
  const btcAmount = ethers.parseEther('0.001');
  const musdAmount = ethers.parseEther('10.5'); // ~0.001 BTC worth

  console.log('\n📝 Amounts to Add:');
  console.log('BTC:', ethers.formatEther(btcAmount));
  console.log('MUSD:', ethers.formatEther(musdAmount));

  // Verify sufficient balance
  if (btcBalance < btcAmount || musdBalance < musdAmount) {
    console.error('\n❌ Insufficient balance');
    return;
  }

  // Step 1: Approve MUSD (like UI)
  console.log('\n1️⃣ Approve MUSD');
  const musdAllowance = await musd.allowance(user.address, routerAddress);
  if (musdAllowance < musdAmount) {
    const tx = await musd.approve(routerAddress, ethers.MaxUint256);
    await tx.wait();
    console.log('✅ MUSD approved');
  } else {
    console.log('✅ Already approved');
  }

  // Step 2: Approve BTC (like UI)
  console.log('\n2️⃣ Approve BTC');
  const btcAllowance = await btc.allowance(user.address, routerAddress);
  if (btcAllowance < btcAmount) {
    const tx = await btc.approve(routerAddress, ethers.MaxUint256);
    await tx.wait();
    console.log('✅ BTC approved');
  } else {
    console.log('✅ Already approved');
  }

  // Step 3: Deposit assets
  console.log('\n3️⃣ Deposit assets (addLiquidity)');

  // CRITICAL: Pass tokens in pool order (token0, token1)
  const tokenA = token0;
  const tokenB = token1;
  const amountA = isMusdToken0 ? musdAmount : btcAmount;
  const amountB = isMusdToken0 ? btcAmount : musdAmount;

  console.log('Calling addLiquidity with:');
  console.log('  tokenA (token0):', tokenA);
  console.log('  tokenB (token1):', tokenB);
  console.log('  amountA:', ethers.formatEther(amountA));
  console.log('  amountB:', ethers.formatEther(amountB));

  // Calculate minimums with 2% slippage (tighter than before)
  const amountAMin = (amountA * 98n) / 100n;
  const amountBMin = (amountB * 98n) / 100n;

  try {
    // First try static call
    console.log('\n⚙️  Testing with staticCall...');
    const result = await router.addLiquidity.staticCall(
      tokenA,
      tokenB,
      amountA,
      amountB,
      amountAMin,
      amountBMin,
      user.address,
      Math.floor(Date.now() / 1000) + 600 // 10 min deadline
    );

    console.log('✅ Static call succeeded!');
    console.log('Expected LP tokens:', ethers.formatEther(result[2]));

    // Now execute real transaction
    console.log('\n💫 Executing real transaction...');
    const tx = await router.addLiquidity(
      tokenA,
      tokenB,
      amountA,
      amountB,
      amountAMin,
      amountBMin,
      user.address,
      Math.floor(Date.now() / 1000) + 600
    );

    console.log('Transaction hash:', tx.hash);
    const receipt = await tx.wait();
    console.log('✅ CONFIRMED in block', receipt?.blockNumber);

    // Step 4: Check LP tokens received
    console.log('\n4️⃣ Receive LP');
    const lpBalance = await pool.balanceOf(user.address);
    console.log('Your LP tokens:', ethers.formatEther(lpBalance));
    console.log('🎉 Start earning swap fees!');
  } catch (error: any) {
    console.log('\n❌ FAILED');
    console.log('Error:', error.message);

    // Try with different token order
    console.log('\n🔄 Trying with swapped token order...');
    try {
      const tx = await router.addLiquidity(
        tokenB, // Swap order
        tokenA,
        amountB,
        amountA,
        amountBMin,
        amountAMin,
        user.address,
        Math.floor(Date.now() / 1000) + 600
      );
      await tx.wait();
      console.log('✅ SUCCESS with swapped order!');
    } catch (e: any) {
      console.log('❌ Also failed with swapped order');
      console.log('Error:', e.message);

      // Provide debugging info
      console.log('\n🔍 Debug Info:');
      console.log(
        'Router code length:',
        (await ethers.provider.getCode(routerAddress)).length
      );
      console.log(
        'Pool code length:',
        (await ethers.provider.getCode(poolAddress)).length
      );
      console.log(
        'MUSD allowance:',
        ethers.formatEther(await musd.allowance(user.address, routerAddress))
      );
      console.log(
        'BTC allowance:',
        ethers.formatEther(await btc.allowance(user.address, routerAddress))
      );
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
