import React from "react";
import SwapComponent from "./components/SwapBox";
import HeaderComponent from "./components/Header";
import { WalletProvider } from "../src/contexts/useWallet";
import { Toaster } from "sonner";
import "./App.css";

function App() {
  return (
    <WalletProvider>
      <div className="App">
      <Toaster
          richColors
          newestOnTop={true}
          closeButton
          headLess
          expand={true}
          position="bottom-left"
        />
        <HeaderComponent />
        <SwapComponent />
      </div>
    </WalletProvider>
  );
}

export default App;
