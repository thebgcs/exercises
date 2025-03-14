const Web3 = require('web3').default || require('web3');

// Check if API key is provided
if (!process.env.INFURA_API_KEY) {
  console.error('Error: INFURA_API_KEY environment variable is required.');
  process.exit(1);
}

// Infura endpoint
const INFURA_URL = `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`;

// Initialize Web3 with error handling
let web3;
try {
  web3 = new Web3(INFURA_URL);
} catch (error) {
  console.error('Error initializing Web3:', error);
  process.exit(1);
}

// Replace with the actual transaction hash from block 13507871 sent by the Coinbase 1 account
const txHash = "0x2ad2bb00718ab0ed8310dacff9c029ea5d41e038d96c9f52561a1e7948759e99"; // e.g., "0xabc123..."

async function main() {
  try {
    // 1) Retrieve the transaction
    const tx = await web3.eth.getTransaction(txHash);
    
    // 2) Console log the three key pieces of transaction data
    console.log("Transaction Details:");
    console.log("To address:", tx.to);
    console.log("Gas price (in wei):", tx.gasPrice);
    console.log("Input call data:", tx.input);
    
    // 3) Construct call data for transferring 100 USDC to Binance 10
    const usdcContractAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // USDC on Ethereum
    const binance10Address = "0x85b931A32a0725Be14285B66f1a22178c672d69B";
    
    // USDC has 6 decimals: 100 USDC -> 100 * 10^6
    const amountUSDC = BigInt(100) * BigInt(10) ** BigInt(6);
    
    // Minimal ERC20 ABI
    const erc20Abi = [
      {
        "constant": false,
        "inputs": [
          { "name": "_to", "type": "address" },
          { "name": "_value", "type": "uint256" }
        ],
        "name": "transfer",
        "outputs": [{ "name": "", "type": "bool" }],
        "type": "function"
      }
    ];
    
    // Create a contract instance for USDC
    const usdcContract = new web3.eth.Contract(erc20Abi, usdcContractAddress);
    
    // Encode the call data for USDC.transfer(binance10Address, amountUSDC)
    const transferCallData = usdcContract.methods
      .transfer(binance10Address, amountUSDC)
      .encodeABI();
    
    console.log("\nUSDC Transfer Input Call Data:");
    console.log(transferCallData);
  } catch (error) {
    console.error("An error occurred:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

main();