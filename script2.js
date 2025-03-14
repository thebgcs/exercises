const { Web3 } = require('web3');
const { toBigInt } = require('web3-utils');
// Replace with your Infura endpoint and the block number "h"
const INFURA_API_KEY = process.env.INFURA_API_KEY || '';
const INFURA_URL = `https://mainnet.infura.io/v3/${INFURA_API_KEY}`;
const BLOCK_NUMBER = 13507875; // Example: the next block mined by the same miner

const web3 = new Web3(INFURA_URL);

async function main() {
  try {
    // Retrieve the block with full transaction objects
    const block = await web3.eth.getBlock(BLOCK_NUMBER, true);

    if (!block || !block.transactions) {
      console.log("No transactions found in this block or invalid block number.");
      return;
    }

    const transactions = block.transactions;

    // Counters for from/to addresses
    const fromCounts = {};
    const toCounts = {};

    // Track the transaction with the highest gas price
    let maxGasPriceTx = null;

    for (let tx of transactions) {
      // "from" address
      const fromAddr = tx.from ? tx.from.toLowerCase() : "unknown";
      fromCounts[fromAddr] = (fromCounts[fromAddr] || 0) + 1;

      // "to" address (if null => contract creation)
      const toAddr = tx.to ? tx.to.toLowerCase() : "contract_creation";
      toCounts[toAddr] = (toCounts[toAddr] || 0) + 1;

      // Compare gas prices
      // (If web3 returns gasPrice as a BN, compare BN properly)
      if (!maxGasPriceTx) {
        maxGasPriceTx = tx;
      } else {
        // Convert gasPrice to BN for a safe comparison
        const currentGasPrice = toBigInt(tx.gasPrice);
        const highestGasPrice = toBigInt(maxGasPriceTx.gasPrice);
        if (currentGasPrice > highestGasPrice) {
          maxGasPriceTx = tx;
        }
      }
    }

    // Find the "from" address with the most transactions
    let maxFromCount = 0;
    let maxFromAddress = null;
    for (let addr in fromCounts) {
      if (fromCounts[addr] > maxFromCount) {
        maxFromCount = fromCounts[addr];
        maxFromAddress = addr;
      }
    }

    // Find the "to" address with the most transactions
    let maxToCount = 0;
    let maxToAddress = null;
    for (let addr in toCounts) {
      if (toCounts[addr] > maxToCount) {
        maxToCount = toCounts[addr];
        maxToAddress = addr;
      }
    }

    // Print the results
    console.log(`Block Number: ${BLOCK_NUMBER}`);
    console.log(`1) Sender with most transactions: ${maxFromAddress} (${maxFromCount} txs)`);
    console.log(`2) Receiver with most transactions: ${maxToAddress} (${maxToCount} txs)`);
    console.log(`3) Transaction with the highest gas price:`);
    console.log(`   TX Hash: ${maxGasPriceTx.hash}`);
    console.log(`   Gas Price (wei): ${maxGasPriceTx.gasPrice}`);
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

main();