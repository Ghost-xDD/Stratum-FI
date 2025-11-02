/**
 * Test script to verify contract connection
 * Run with: npx tsx lib/contracts/test-connection.ts
 */

import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, MEZO_TESTNET } from './addresses';
import { VAULT_CONTROLLER_ABI } from './abis';

async function testConnection() {
  console.log('🔗 Testing connection to Mezo Testnet...\n');

  try {
    // Create provider
    const provider = new ethers.JsonRpcProvider(
      MEZO_TESTNET.rpcUrls.default.http[0]
    );

    // Test 1: Get network
    const network = await provider.getNetwork();
    console.log('✅ Connected to network:', network.name);
    console.log('   Chain ID:', network.chainId.toString());

    // Test 2: Get block number
    const blockNumber = await provider.getBlockNumber();
    console.log('✅ Current block:', blockNumber);

    // Test 3: Read from VaultController
    const vaultController = new ethers.Contract(
      CONTRACT_ADDRESSES.VaultController,
      VAULT_CONTROLLER_ABI,
      provider
    );

    // Test with your test address
    const testAddress = '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199';
    const balance = await vaultController.balanceOf(testAddress);
    console.log('✅ VaultController.balanceOf() works');
    console.log('   Test address:', testAddress);
    console.log('   Balance:', ethers.formatEther(balance), 'BTC');

    console.log('\n🎉 All tests passed! Contract integration is working.\n');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testConnection();
