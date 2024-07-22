const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const TokenModule = buildModule("TokenModule", (m) => {
  // You need to provide the unlock time here. Calculate an appropriate future time.
  const unlockTime = Math.floor(Date.now() / 1000) + (24 * 60 * 60); // 24 hours from now in seconds
  const token = m.contract("Sample", [unlockTime]);

  return { token };
});

module.exports = TokenModule;
