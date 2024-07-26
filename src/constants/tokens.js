export const WETH = {
  chainId: 11155111,
  address: import.meta.env.VITE_WETH_ADDRESS,
  decimals: 18,
  symbol: "WETH",
  name: "Wrapped Ether",
  isToken: true,
  isNative: true,
  wrapped: true,
};

export const USDC = {
  chainId: 11155111,
  address: import.meta.env.VITE_USDC_ADDRESS,
  decimals: 6,
  symbol: "USDC",
  name: "USD Coin",
  isToken: true,
  isNative: true,
  wrapped: false,
};

export const DAI = {
  chainId: 11155111,
  address: import.meta.env.VITE_DAI_ADDRESS,
  decimals: 18,
  symbol: "DAI",
  name: "DAI",
  isToken: true,
  isNative: false,
  wrapped: false,
};

export const LINK = {
  chainId: 11155111,
  address: import.meta.env.VITE_LINK_ADDRESS,
  decimals: 18,
  symbol: "LINK",
  name: "ChainLink",
  isToken: true,
  isNative: false,
  wrapped: false,
};
