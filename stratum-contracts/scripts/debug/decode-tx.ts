import { ethers } from 'hardhat';

/**
 * Decode the successful UI transaction to see exact parameters
 */
async function main() {
  const txHash = '0xde34292a9f23758c2ab500e51608aafc0673f3d06c5fcc86259c7eef76c0f9d2';
  
  console.log('\n🔍 DECODING SUCCESSFUL TRANSACTION\n');
  console.log('Tx Hash:', txHash);
  
  // Get transaction
  const tx = await ethers.provider.getTransaction(txHash);
  
  if (!tx) {
    console.log('Transaction not found');
    return;
  }
  
  console.log('\n📋 Transaction Details:');
  console.log('From:', tx.from);
  console.log('To:', tx.to);
  console.log('Value:', ethers.formatEther(tx.value), 'BTC');
  console.log('Gas Limit:', tx.gasLimit.toString());
  console.log('Gas Price:', ethers.formatUnits(tx.gasPrice || 0n, 'gwei'), 'gwei');
  
  // Decode input data
  console.log('\n📝 Input Data:');
  console.log('Data:', tx.data);
  console.log('Data length:', tx.data.length, 'chars');
  
  // Try to decode addLiquidity function
  const routerAbi = [
    'function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) returns (uint amountA, uint amountB, uint liquidity)',
    'function addLiquidity(address tokenA, address tokenB, bool stable, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline)',
  ];
  
  for (let i = 0; i < routerAbi.length; i++) {
    try {
      const iface = new ethers.Interface([routerAbi[i]]);
      const decoded = iface.parseTransaction({ data: tx.data });
      
      console.log(`\n✅ Decoded with ABI version ${i + 1}:`);
      console.log('Function:', decoded?.name);
      console.log('\nParameters:');
      
      if (decoded?.args) {
        for (let j = 0; j < decoded.args.length; j++) {
          const key = decoded.fragment.inputs[j].name;
          const value = decoded.args[j];
          
          if (typeof value === 'bigint') {
            // Check if it's an address (20 bytes)
            if (value < 2n ** 160n) {
              console.log(`  ${key}: ${ethers.formatEther(value)}`);
            } else {
              console.log(`  ${key}: ${value.toString()}`);
            }
          } else if (typeof value === 'string' && value.startsWith('0x') && value.length === 42) {
            console.log(`  ${key}: ${value}`);
          } else if (typeof value === 'boolean') {
            console.log(`  ${key}: ${value}`);
          } else {
            console.log(`  ${key}:`, value);
          }
        }
      }
      
      break; // Successfully decoded
    } catch (e) {
      if (i === routerAbi.length - 1) {
        console.log('\n❌ Could not decode with standard ABI');
        console.log('Function signature:', tx.data.slice(0, 10));
      }
    }
  }
  
  // Get receipt
  console.log('\n📊 Transaction Receipt:');
  const receipt = await ethers.provider.getTransactionReceipt(txHash);
  
  if (receipt) {
    console.log('Status:', receipt.status === 1 ? '✅ Success' : '❌ Failed');
    console.log('Block:', receipt.blockNumber);
    console.log('Gas Used:', receipt.gasUsed.toString());
    console.log('Logs:', receipt.logs.length);
    
    // Decode logs
    console.log('\n📄 Event Logs:');
    for (const log of receipt.logs) {
      console.log(`  Log from: ${log.address}`);
      console.log(`  Topics: ${log.topics.length}`);
      if (log.topics.length > 0) {
        console.log(`  Topic 0: ${log.topics[0]}`);
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

