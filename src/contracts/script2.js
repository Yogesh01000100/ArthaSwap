import { ethers } from "ethers";
import SWAP_ROUTER_ABI from "./abis/swaprouter.json" assert { type: "json" };
import TOKEN_IN_ABI from "./abis/weth.json" assert { type: "json" };
import { WETH, USDC, DAI } from '../constants/tokens';
import "dotenv/config";

const SWAP_ROUTER_CONTRACT_ADDRESS = import.meta.env.VITE_SWAP_ROUTER_CONTRACT_ADDRESS;

const provider = new ethers.JsonRpcProvider(
  `https://eth-sepolia.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_KEY}`
);
const signer = new ethers.Wallet(import.meta.env.VITE_PRIVATE_KEY, provider);
const FEE_SIZE = 3;

async function approveToken(tokenAddress, tokenABI, amount, wallet) {
  try {
    const tokenContract = new ethers.Contract(tokenAddress, tokenABI, wallet);

    const approveTransaction = await tokenContract.approve.populateTransaction(
      SWAP_ROUTER_CONTRACT_ADDRESS,
      ethers.parseUnits(amount.toString(), DAI.decimals)
    );

    const options = {
      gasLimit: 2000000,
      gasPrice: ethers.parseUnits("40", "gwei"),
    };
    const transactionResponse = await wallet.sendTransaction({
      ...approveTransaction,
      ...options,
    });
    console.log(`-------------------------------`);
    console.log(`Sending Approval Transaction...`);
    console.log(`-------------------------------`);
    console.log(`Transaction Sent: ${transactionResponse.hash}`);
    console.log(`-------------------------------`);
    const receipt = await transactionResponse.wait();
    console.log(
      `Approval Transaction Confirmed! https://sepolia.etherscan.io/txn/${receipt.hash}`
    );
  } catch (error) {
    console.error("An error occurred during token approval:", error);
    throw new Error("Token approval failed");
  }
}

function encodePath(path, fees) {
  if (path.length != fees.length + 1) {
    throw new Error("path/fee lengths do not match");
  }

  let encoded = "0x";
  for (let i = 0; i < path.length - 1; i++) {
    encoded += path[i].slice(2);
    encoded += fees[i].toString(16).padStart(2 * FEE_SIZE, "0");
  }
  encoded += path[path.length - 1].slice(2);
  return encoded.toLowerCase();
}

async function executeSwap(swapRouter, params) {
  try {
    console.log("------------executing swap function ! --------------");
    const transaction = await swapRouter.exactInput.populateTransaction(params);

    const receipt = await signer.sendTransaction({
      ...transaction,
      gasLimit: 2000000,
      gasPrice: ethers.parseUnits("40", "gwei"),
    });
    console.log(`-------------------------------`);
    console.log(`Receipt: https://sepolia.etherscan.io/tx/${receipt.hash}`);
    console.log(`-------------------------------`);
  } catch (error) {
    console.error("An error occurred during the executeSwap:", error);
    throw new Error(`Swap failed: ${error.message} | ${error.stack}`);
  }
}

async function main() {
  try {
    {
      /* -------------- path ----------------- */
    }
    const path = [DAI.address, USDC.address, WETH.address]; // Path : DAI -> USDC -> WETH
    const fees = [500, 500]; // fee pool 
    const encodedPath = encodePath(path, fees);
    console.log("encodedPath: ", encodedPath);

    const amountIn = ethers.parseUnits("1000", DAI.decimals); //1000 DAI

    await approveToken(DAI.address, TOKEN_IN_ABI, amountIn, signer);

    const params = {
      path: encodedPath,
      recipient: signer.address,
      deadline: Math.floor(Date.now() / 1000) + 600,
      amountIn: amountIn,
      amountOutMinimum: 0,
    };
    const swapRouter = new ethers.Contract(
      SWAP_ROUTER_CONTRACT_ADDRESS,
      SWAP_ROUTER_ABI,
      signer
    );
    await executeSwap(swapRouter, params, signer);
  } catch (error) {
    console.error("An error occurred:", error.message);
  }
}

main();
