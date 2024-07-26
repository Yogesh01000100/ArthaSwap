import { ethers } from "ethers";
import SWAP_ROUTER_ABI from "../contracts/abis/swaprouter.json";
import TOKEN_IN_ABI from "../contracts/abis/weth.json";

const SWAP_ROUTER_CONTRACT_ADDRESS = import.meta.env
  .VITE_SWAP_ROUTER_CONTRACT_ADDRESS;

const getProviderOrSigner = async () => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  return provider.getSigner();
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
  }
};
