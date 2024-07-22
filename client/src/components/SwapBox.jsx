import React, { useState } from "react";
import { useWallet } from "../contexts/useWallet";
import ClipLoader from "react-spinners/ClipLoader";

const SwapComponent = () => {
  const [tokensIn, setTokensIn] = useState([
    { token: "ETH", amount: "" },
  ]);
  const [tokenOut, setTokenOut] = useState("USDC");

  const { connectWallet, isConnected, loading } = useWallet();

  const handleTokenChange = (value, index) => {
    const newTokensIn = [...tokensIn];
    newTokensIn[index].token = value;
    setTokensIn(newTokensIn);
  };

  const handleAmountChange = (value, index) => {
    const newTokensIn = [...tokensIn];
    newTokensIn[index].amount = value;
    setTokensIn(newTokensIn);
  };

  const addTokenInput = () => {
    setTokensIn([...tokensIn, { token: "", amount: "" }]);
  };

  const demoSwap = () => {
    console.log("Performing demo swap with the following tokens:", tokensIn, "to", tokenOut);
  };

  return (
    <div>
      <div className="max-w-md mx-auto mt-10 py-5 px-7 bg-gray-800 text-white rounded-xl shadow-xl">
        {tokensIn.map((token, index) => (
          <div key={index} className="mb-4 flex flex-col items-start">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Token {index + 1}:
            </label>
            <select
              className="w-full p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none cursor-pointer"
              value={token.token}
              onChange={(e) => handleTokenChange(e.target.value, index)}
            >
              <option value="">Select Token</option>
              <option value="ETH">Ethereum (ETH)</option>
              <option value="DAI">Dai (DAI)</option>
              <option value="BTC">Bitcoin (BTC)</option>
            </select>
            <input
              type="number"
              placeholder="Amount"
              className="mt-2 w-full p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
              value={token.amount}
              onChange={(e) => handleAmountChange(e.target.value, index)}
            />
          </div>
        ))}
        <button
          onClick={addTokenInput}
          className="bg-blue-500 hover:bg-blue-400 text-white font-medium py-2 px-4 rounded-xl mt-2"
        >
          Add Token
        </button>
      </div>
      <div className="arrow-container" style={{ position: 'relative', textAlign: 'center', margin: '13px 0' }}>
        <img src="/src/assets/pointer.png" alt="Switch" className="w-8 h-8 mx-auto arrow-animation" />
      </div>
      <div className="max-w-md mx-auto mt-2 py-5 px-7 bg-gray-800 text-white rounded-xl shadow-xl">
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Select Token:
        </label>
        <select
          className="w-full p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none cursor-pointer"
          value={tokenOut}
          onChange={(e) => setTokenOut(e.target.value)}
        >
          <option value="USDC">USD Coin (USDC)</option>
        </select>
      </div>

      <div className="max-w-md mx-auto mt-2 p-4 flex flex-col items-center">
        <button
          className="w-1/2 py-3 bg-pink-600 hover:bg-pink-500 text-white font-medium rounded-xl"
          onClick={isConnected ? demoSwap : connectWallet}
          disabled={loading}
        >
          {loading ? (
            <ClipLoader size={24} color={"#fff"} loading={loading} />
          ) : isConnected ? (
            "Swap"
          ) : (
            "Connect Wallet"
          )}
        </button>
      </div>
    </div>
  );
};

export default SwapComponent;
