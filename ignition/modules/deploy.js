const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const SwapModule = buildModule("SwapModule", (m) => {
  const uniswapRouterAddress = "0x586a31a288e178369fff020ba63d2224cf8661e9";
  const multiTokenSwap = m.contract("MultiTokenSwap", [uniswapRouterAddress]);

  return { multiTokenSwap };
});

module.exports = SwapModule;
