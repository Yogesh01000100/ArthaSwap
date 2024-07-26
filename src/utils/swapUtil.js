import { ethers } from "ethers";
import SWAP_ROUTER_ABI from "../contracts/abis/swaprouter.json";
import TOKEN_IN_ABI from "../contracts/abis/weth.json";

const SWAP_ROUTER_CONTRACT_ADDRESS = import.meta.env
  .VITE_SWAP_ROUTER_CONTRACT_ADDRESS;
const FEE_SIZE = 3;
const getProviderOrSigner = async () => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    return provider.getSigner();
  } catch (error) {
    console.log(error);
    throw new Error("Something Went wrong!");
  }
};

const encodePath = (path, fees) => {
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
};

export const approveToken = async (tokenAddress, amount, decimals) => {
  try {
    const signer = getProviderOrSigner();
    const tokenContract = new ethers.Contract(
      tokenAddress,
      TOKEN_IN_ABI,
      signer
    );
    const amountToApprove = ethers.parseUnits(amount.toString(), decimals);
    return tokenContract.approve(SWAP_ROUTER_CONTRACT_ADDRESS, amountToApprove);
  } catch (error) {
    console.log(error);
    throw new Error("Something Went wrong!");
  }
};

export const executeSingleTokenSwap = async (amountIn, tokenIn, tokenOut) => {
  try {
    const signer = await getProviderOrSigner();
    const swapRouter = new ethers.Contract(
      SWAP_ROUTER_CONTRACT_ADDRESS,
      SWAP_ROUTER_ABI,
      signer
    );
    const params = {
      tokenIn: tokenIn.address,
      tokenOut: tokenOut.address,
      fee: "500",
      recipient: await signer.getAddress(),
      amountIn: ethers.parseUnits(amountIn, tokenIn.decimals),
      amountOutMinimum: 0,
      sqrtPriceLimitX96: 0,
    };
    const transaction = await swapRouter.exactInputSingle(params);
    return transaction.wait();
  } catch (error) {
    console.log(error);
    throw new Error("Something went wrong!");
  }
};

export const executeMultihopTokenSwap = async (
  token1,
  token2,
  token3,
  amountInput
) => {
  try {
    const signer = await getProviderOrSigner();
    const swapRouter = new ethers.Contract(
      SWAP_ROUTER_CONTRACT_ADDRESS,
      SWAP_ROUTER_ABI,
      signer
    );

    const path = [token1.address, token2.address, token3.address]; // Path : T1 -> T2 -> T3
    const fees = [500, 500]; // fee pool
    const encodedPath = encodePath(path, fees);
    const amount = ethers.parseUnits(amountInput, token1.decimals);

    const params = {
      path: encodedPath,
      recipient: signer.address,
      deadline: Math.floor(Date.now() / 1000) + 600,
      amountIn: amount,
      amountOutMinimum: 0,
    };

    const transaction = await swapRouter.exactInput(params);
    return transaction.wait();
  } catch (error) {
    console.log(error);
    throw new Error("Something went wrong!");
  }
};
