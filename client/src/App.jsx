import React, { useState } from "react";
import SwapComponent from "./components/SwapBox";
import HeaderComponent from "./components/Header";
import "./App.css";

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  const toggleConnection = () => {
    setIsConnected(!isConnected);
    setWalletAddress(isConnected ? "" : "0xab...cd123");
  };

  return (
    <div className="App">
      <HeaderComponent
        isConnected={isConnected}
        walletAddress={walletAddress}
        onConnectClick={toggleConnection}
      />
      <SwapComponent
        isConnected={isConnected}
        onConnectClick={toggleConnection}
      />
    </div>
  );
}

export default App;
