import SwapComponent from "./components/SwapBox";
import HeaderComponent from "./components/Header";
import { WalletProvider } from "../src/contexts/useWallet";
import LiquidityWarningCard from "./components/WarningCard";
import { Box } from "@chakra-ui/react";
import "./App.css";

function App() {
  return (
    <WalletProvider>
      <HeaderComponent />
      <SwapComponent />
      <Box position="fixed" bottom="0" left="0" m={2}>
        <LiquidityWarningCard />
      </Box>
    </WalletProvider>
  );
}

export default App;
