import React, { useState } from "react";

const SwapComponent = ({ isConnected, onConnectClick }) => {
  const [tokensIn, setTokensIn] = useState([
    { token: "ETH", amount: "" },
    { token: "DAI", amount: "" },
    { token: "BTC", amount: "" },
  ]);

  const handleTokenChange = (value, index) => {
    const newTokens = [...tokensIn];
    newTokens[index].token = value;
    setTokensIn(newTokens);
  };

  const handleAmountChange = (value, index) => {
    const newTokens = [...tokensIn];
    newTokens[index].amount = value;
    setTokensIn(newTokens);
  };

  return (
    <div>
      <div className="max-w-md mx-auto mt-10 p-4 bg-gray-800 text-white rounded-lg shadow-xl">
        {tokensIn.map((token, index) => (
          <div key={index} className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              From (Token {index + 1}):
            </label>
            <select
              className="w-full p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none cursor-pointer"
              value={token.token}
              onChange={(e) => handleTokenChange(e.target.value, index)}
            >
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
      </div>

      <div className="max-w-md mx-auto mt-5 p-4 flex flex-col items-center">
        <button
          className="w-1/2 py-3 bg-pink-600 hover:bg-pink-500 text-white font-medium rounded-lg"
          onClick={onConnectClick}
        >
          {isConnected ? "Swap" : "Connect Wallet"}
        </button>
      </div>
    </div>
  );
};

export default SwapComponent;
