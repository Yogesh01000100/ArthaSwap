import { ethers } from "ethers";
import FACTORY_ABI from "./abis/factory.json" assert { type: "json" };
import QUOTER_ABI from "./abis/quoter.json" assert { type: "json" };
import SWAP_ROUTER_ABI from "./abis/swaprouter.json" assert { type: "json" };
import POOL_ABI from "./abis/pool.json" assert { type: "json" };
import TOKEN_IN_ABI from "./abis/weth.json" assert { type: "json" };
import { WETH, USDC } from '../constants/tokens';
import "dotenv/config";

const V3_FACTORY_ADDRESS = import.meta.env.VITE_V3_FACTORY_ADDRESS;
const QUOTER_CONTRACT_ADDRESS = import.meta.env.VITE_QUOTER_CONTRACT_ADDRESS
const SWAP_ROUTER_CONTRACT_ADDRESS = import.meta.env.VITE_SWAP_ROUTER_CONTRACT_ADDRESS

const provider = new ethers.JsonRpcProvider(
  `https://eth-sepolia.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_KEY}`
);
const factoryContract = new ethers.Contract(
  V3_FACTORY_ADDRESS,
  FACTORY_ABI,
  provider
);
const quoterContract = new ethers.Contract(
  QUOTER_CONTRACT_ADDRESS,
  QUOTER_ABI,
  provider
);
const signer = new ethers.Wallet(import.meta.env.PRIVATE_KEY, provider);

async function approveToken(tokenAddress, tokenABI, amount, wallet) {
  try {
    const tokenContract = new ethers.Contract(tokenAddress, tokenABI, wallet);

    const approveTransaction = await tokenContract.approve.populateTransaction(
      SWAP_ROUTER_CONTRACT_ADDRESS,
      ethers.parseUnits(amount.toString(), USDC.decimals)
    );

    const transactionResponse = await wallet.sendTransaction(
      approveTransaction
    );
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

async function getPoolInfo(factoryContract, tokenIn, tokenOut) { // 500 fee pool
  const poolAddress = await factoryContract.getPool(
    tokenIn.address,
    tokenOut.address,
    500
  );
  if (!poolAddress) {
    throw new Error("Failed to get pool address");
  }
  const poolContract = new ethers.Contract(poolAddress, POOL_ABI, provider);
  const [token0, token1, fee] = await Promise.all([
    poolContract.token0(),
    poolContract.token1(),
    poolContract.fee(),
  ]);
  return { poolContract, token0, token1, fee };
}

async function quoteAndLogSwap(quoterContract, fee, signer, amountIn) {
  const quotedAmountOut = await quoterContract.quoteExactInputSingle.staticCall(
    {
      tokenIn: USDC.address,
      tokenOut: WETH.address,
      fee: fee,
      recipient: signer.address,
      deadline: Math.floor(new Date().getTime() / 1000 + 60 * 10),
      amountIn: amountIn,
      sqrtPriceLimitX96: 0,
    }
  );
  console.log(`-------------------------------`);
  console.log(
    `Token Swap will result in: ${ethers.formatUnits(
      quotedAmountOut[0].toString(),
      WETH.decimals
    )} ${WETH.symbol} for ${ethers.formatUnits(amountIn, USDC.decimals)} ${
      USDC.symbol
    }`
  );
  const amountOut = ethers.formatUnits(quotedAmountOut[0], WETH.decimals);
  return amountOut;
}

async function prepareSwapParams(poolContract, signer, amountIn, amountOut) {
  return {
    tokenIn: USDC.address,
    tokenOut: WETH.address,
    fee: await poolContract.fee(),
    recipient: signer.address,
    amountIn: amountIn,
    amountOutMinimum: ethers.parseUnits(amountOut.toString(), WETH.decimals),
    sqrtPriceLimitX96: 0,
  };
}

async function executeSwap(swapRouter, params, signer) {
  const transaction = await swapRouter.exactInputSingle.populateTransaction(
    params
  );
  const receipt = await signer.sendTransaction(transaction);
  console.log(`-------------------------------`);
  console.log(`Receipt: https://sepolia.etherscan.io/tx/${receipt.hash}`);
  console.log(`-------------------------------`);
}

async function main(swapAmount) {
  const inputAmount = swapAmount;
  const amountIn = ethers.parseUnits(inputAmount.toString(), USDC.decimals);

  try {
    await approveToken(USDC.address, TOKEN_IN_ABI, amountIn, signer);
    const { poolContract, token0, token1, fee } = await getPoolInfo(
      factoryContract,
      USDC,
      WETH
    );
    console.log(`-------------------------------`);
    console.log(`Fetching Quote for: ${USDC.symbol} to ${WETH.symbol}`);
    console.log(`-------------------------------`);
    console.log(`Swap Amount: ${ethers.formatUnits(amountIn, USDC.decimals)}`);

    const quotedAmountOut = await quoteAndLogSwap(
      quoterContract,
      fee,
      signer,
      amountIn
    );

    const params = await prepareSwapParams(
      poolContract,
      signer,
      amountIn,
      quotedAmountOut
    );
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

main(100); // 100 USDC
