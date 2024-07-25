import SwapComponent from "./components/SwapBox";
import HeaderComponent from "./components/Header";
import { WalletProvider } from "../src/contexts/useWallet";
import "./App.css";

function App() {
  return (
    <WalletProvider>
      <HeaderComponent />
      <SwapComponent />
    </WalletProvider>
  );
}

export default App;
