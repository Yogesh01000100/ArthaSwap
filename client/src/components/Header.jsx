import React from "react";

const HeaderComponent = ({ isConnected, walletAddress, onConnectClick }) => {
  return (
    <div className="text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex space-x-7">
          <a href="#" className="hover:text-gray-300">
            Trade
          </a>
          <a href="#" className="hover:text-gray-300">
            Explore
          </a>
          <a href="#" className="hover:text-gray-300">
            Pool
          </a>
        </div>
        <button
          onClick={onConnectClick}
          className="bg-pink-600 hover:bg-pink-500 px-5 py-2 rounded"
        >
          {isConnected ? walletAddress : "Connect"}
        </button>
      </div>
    </div>
  );
};

export default HeaderComponent;
