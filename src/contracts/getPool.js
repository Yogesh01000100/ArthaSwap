import { ethers } from "ethers";
import V3FactoryAbi from "./abis/factory.json" assert { type: "json" };
import "dotenv/config";

const V3_FACTORY_ADDRESS = import.meta.env.VITE_V3_FACTORY_ADDRESS;

// tokns
const WETH_ADDRESS = import.meta.env.VITE_WETH_ADDRESS;
const USDC_ADDRESS = import.meta.env.VITE_USDC_ADDRESS;
const DAIAddress = import.meta.env.VITE_DAI_ADDRESS;

const main = async () => {
  const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_KEY}`);

  const factory = new ethers.Contract(
    V3_FACTORY_ADDRESS,
    V3FactoryAbi,
    provider
  );
  const res = await factory.getPool(DAIAddress, USDC_ADDRESS, 500);
  console.log("res", res);
};

main();
