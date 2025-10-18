import { ethers } from 'hardhat';

/**
 * Add liquidity to Tigris MUSD/BTC pool
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
  console.log('Router:', routerAddress);
  console.log('Pool:', poolAddress);

  // Get contracts
  const router = await ethers.getContractAt('ITigrisRouter', routerAddress);
  const pool = await ethers.getContractAt('ITigrisPool', poolAddress);
  const btc = await ethers.getContractAt('IERC20', btcAddress);
  const musd = await ethers.getContractAt('IERC20', musdAddress);

  // Check pool reserves to get ratio
  console.log('\n📊 Pool State:');
  const [reserve0, reserve1] = await pool.getReserves();
  const token0 = await pool.token0();
  const token1 = await pool.token1();

  console.log('Token0:', token0);
  console.log('Token1:', token1);
  console.log('Reserve0:', ethers.formatEther(reserve0));
  console.log('Reserve1:', ethers.formatEther(reserve1));

  // Determine which is which
  const isMusdToken0 = token0.toLowerCase() === musdAddress.toLowerCase();
  const musdReserve = isMusdToken0 ? reserve0 : reserve1;
  const btcReserve = isMusdToken0 ? reserve1 : reserve0;

  console.log('\nMUSD Reserve:', ethers.formatEther(musdReserve));
  console.log('BTC Reserve:', ethers.formatEther(btcReserve));

  // Calculate ratio
  const ratio = Number(musdReserve) / Number(btcReserve);
  console.log('Ratio (MUSD per BTC):', ratio.toFixed(2));

  // Check user balances
  console.log('\n💰 Your Balances:');
  const btcBalance = await btc.balanceOf(user.address);
  const musdBalance = await musd.balanceOf(user.address);

  console.log('BTC:', ethers.formatEther(btcBalance));
  console.log('MUSD:', ethers.formatEther(musdBalance));

  // Amounts to add 
  const btcAmount = ethers.parseEther('0.001'); // 0.001 BTC
  const musdAmount = ethers.parseEther((0.001 * ratio).toFixed(6)); // Proportional MUSD

  console.log('\n📝 Liquidity to Add:');
  console.log('BTC:', ethers.formatEther(btcAmount));
  console.log('MUSD:', ethers.formatEther(musdAmount));

  // Check if user has enough
  if (btcBalance < btcAmount) {
    console.error('\n❌ Insufficient BTC balance');
    console.log('Need:', ethers.formatEther(btcAmount));
    console.log('Have:', ethers.formatEther(btcBalance));
    return;
  }

  if (musdBalance < musdAmount) {
    console.error('\n❌ Insufficient MUSD balance');
    console.log('Need:', ethers.formatEther(musdAmount));
    console.log('Have:', ethers.formatEther(musdBalance));
    return;
  }

  // Step 1: Approve BTC
  console.log('\n1️⃣ Approving BTC...');
  const btcAllowance = await btc.allowance(user.address, routerAddress);
  if (btcAllowance < btcAmount) {
    const approveBtcTx = await btc.approve(routerAddress, ethers.MaxUint256);
    await approveBtcTx.wait();
    console.log('✅ BTC approved');
  } else {
    console.log('✅ BTC already approved');
  }

  // Step 2: Approve MUSD
  console.log('\n2️⃣ Approving MUSD...');
  const musdAllowance = await musd.allowance(user.address, routerAddress);
  if (musdAllowance < musdAmount) {
    const approveMusdTx = await musd.approve(routerAddress, ethers.MaxUint256);
    await approveMusdTx.wait();
    console.log('✅ MUSD approved');
  } else {
    console.log('✅ MUSD already approved');
  }

  // Step 3: Add liquidity
  console.log('\n3️⃣ Adding liquidity...');

  // Calculate minimum amounts (5% slippage)
  const btcMin = (btcAmount * 95n) / 100n;
  const musdMin = (musdAmount * 95n) / 100n;

  console.log('Min BTC:', ethers.formatEther(btcMin));
  console.log('Min MUSD:', ethers.formatEther(musdMin));

  try {
    // Try simulation first
    console.log('\n⚙️  Simulating transaction...');
    const [amountA, amountB, liquidity] = await router.addLiquidity.staticCall(
      btcAddress,
      musdAddress,
      btcAmount,
      musdAmount,
      btcMin,
      musdMin,
      user.address,
      Math.floor(Date.now() / 1000) + 300 // 5 min deadline
    );

    console.log('✅ Simulation passed!');
    console.log('Expected results:');
    console.log('  BTC to add:', ethers.formatEther(amountA));
    console.log('  MUSD to add:', ethers.formatEther(amountB));
    console.log('  LP tokens:', ethers.formatEther(liquidity));

    // Execute actual transaction
    console.log('\n💫 Executing transaction...');
    const tx = await router.addLiquidity(
      btcAddress,
      musdAddress,
      btcAmount,
      musdAmount,
      btcMin,
      musdMin,
      user.address,
      Math.floor(Date.now() / 1000) + 300
    );

    console.log('Transaction hash:', tx.hash);
    console.log('Waiting for confirmation...');

    const receipt = await tx.wait();
    console.log('✅ Transaction confirmed!');
    console.log('Block:', receipt?.blockNumber);
    console.log('Gas used:', receipt?.gasUsed.toString());

    // Check new balances
    console.log('\n💰 New Balances:');
    const newBtcBalance = await btc.balanceOf(user.address);
    const newMusdBalance = await musd.balanceOf(user.address);
    const lpBalance = await pool.balanceOf(user.address);

    console.log('BTC:', ethers.formatEther(newBtcBalance));
    console.log('MUSD:', ethers.formatEther(newMusdBalance));
    console.log('LP Tokens:', ethers.formatEther(lpBalance));

    console.log('\n🎉 SUCCESS! Liquidity added successfully!');
  } catch (error: any) {
    console.log('\n❌ FAILED');
    console.log('Error:', error.message);

    if (error.message.includes('execution reverted')) {
      console.log('\n💡 This is likely due to:');
      console.log('   - Pool being permissioned/whitelisted on testnet');
      console.log('   - Need to be added to curated integrations');
      console.log('   - Contact Mezo team for whitelist access');
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
