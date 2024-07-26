import SwapComponent from "./components/SwapBox";
import HeaderComponent from "./components/Header";
import { WalletProvider } from "../src/contexts/useWallet";
import LiquidityWarningCard from "./components/WarningCard";
import { VStack, Box } from '@chakra-ui/react';
import "./App.css";

function App() {
  return (
    <WalletProvider>
      <VStack spacing={4} align="stretch">
        <HeaderComponent />
        <SwapComponent />
      </VStack>
      <Box position="fixed" bottom="0" left="0" m={4}>
        <LiquidityWarningCard />
      </Box>
    </WalletProvider>
  );
}

export default App;
