import { ethers } from 'hardhat';

async function main() {
  const txHash = '0xde34292a9f23758c2ab500e51608aafc0673f3d06c5fcc86259c7eef76c0f9d2';
  
  console.log('\n🔍 DETAILED TRANSACTION DECODE\n');
  
  const tx = await ethers.provider.getTransaction(txHash);
  if (!tx) return;
  
  const data = tx.data;
  console.log('Function signature:', data.slice(0, 10));
  console.log('Expected: 0x5a47ddc3');
  
  // Manual decode
  console.log('\n📝 Manual Parameter Decode:');
  const params = data.slice(10); // Remove 0x and function sig
  
  let offset = 0;
  const readAddress = () => {
    const addr = '0x' + params.slice(offset + 24, offset + 64);
    offset += 64;
    return addr;
  };
  
  const readUint = () => {
    const val = '0x' + params.slice(offset, offset + 64);
    offset += 64;
    return BigInt(val);
  };
  
  const readBool = () => {
    const val = '0x' + params.slice(offset, offset + 64);
    offset += 64;
    return BigInt(val) === 1n;
  };
  
  const tokenA = readAddress();
  const tokenB = readAddress();
  const stable = readBool();
  const amountADesired = readUint();
  const amountBDesired = readUint();
  const amountAMin = readUint();
  const amountBMin = readUint();
  const to = readAddress();
  const deadline = readUint();
  
  console.log('tokenA (MUSD):', tokenA);
  console.log('tokenB (BTC):', tokenB);
  console.log('stable:', stable, '⭐ THIS IS THE KEY!');
  console.log('amountADesired:', ethers.formatEther(amountADesired), 'MUSD');
  console.log('amountBDesired:', ethers.formatEther(amountBDesired), 'BTC');
  console.log('amountAMin:', ethers.formatEther(amountAMin), 'MUSD');
  console.log('amountBMin:', ethers.formatEther(amountBMin), 'BTC');
  console.log('to:', to);
  console.log('deadline:', new Date(Number(deadline) * 1000).toLocaleString());
  
  console.log('\n💡 THE FUNCTION HAS A "stable" PARAMETER!');
  console.log('Correct signature:');
  console.log('addLiquidity(address tokenA, address tokenB, bool stable, ...)');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

