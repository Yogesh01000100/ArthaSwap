import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWallet } from "../contexts/useWallet";
import {
  Box,
  Button,
  Select,
  Input,
  Text,
  Flex,
  useToast,
  HStack,
  Skeleton,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
} from "@chakra-ui/react";
import ERC20ABI from "../contracts/abis/abi.json";
import { subscribeToPrice, unsubscribeFromPrice } from "../helpers/wsHelper";

const SwapComponent = () => {
  const [tokensIn, setTokensIn] = useState([{ token: "WETH", amount: "" }]);
  const [tokenOut, setTokenOut] = useState("USDC");

  const [balances, setBalances] = useState({
    USDC: "",
    WETH: "",
    LINK: "",
    DAI: "",
  });
  const [prices, setPrices] = useState({ USDC: 0, LINK: 0, ETH: 0, DAI: 0 });
  const [loadingBalances, setLoadingBalances] = useState(true);
  const { connectWallet, isConnected, loading } = useWallet();
  const toast = useToast();

  useEffect(() => {
    if (isConnected) {
      loadBalances();
    }
  }, [isConnected]);

  useEffect(() => {
    const streams = ["linkusdt@trade", "usdcusdt@trade", "ethusdt@trade"];

    streams.forEach((stream) => {
      subscribeToPrice(stream, (price) => {
        let token = stream.split("@")[0].toUpperCase();
        token = token.replace("USDT", "");
        setPrices((prevPrices) => ({ ...prevPrices, [token]: price }));
      });
    });

    // Cleanup subscriptions on component unmount
    return () => {
      streams.forEach((stream) => {
        unsubscribeFromPrice(stream);
      });
    };
  }, []);

  const loadBalances = async () => {
    setLoadingBalances(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();

      const usdcContract = new ethers.Contract(
        import.meta.env.VITE_USDC_ADDRESS,
        ERC20ABI,
        signer
      );
      const wethContract = new ethers.Contract(
        import.meta.env.VITE_WETH_ADDRESS,
        ERC20ABI,
        signer
      );
      const linkContract = new ethers.Contract(
        import.meta.env.VITE_LINK_ADDRESS,
        ERC20ABI,
        signer
      );
      const daiContract = new ethers.Contract(
        import.meta.env.VITE_DAI_ADDRESS,
        ERC20ABI,
        signer
      );
      const [usdcBalance, wethBalance, linkBalance, ethBalance, daiBalance] =
        await Promise.all([
          usdcContract.balanceOf(walletAddress),
          wethContract.balanceOf(walletAddress),
          linkContract.balanceOf(walletAddress),
          provider.getBalance(walletAddress),
          daiContract.balanceOf(walletAddress),
        ]);

      setBalances({
        USDC: parseFloat(ethers.formatUnits(usdcBalance, 6)).toFixed(4),
        WETH: parseFloat(ethers.formatUnits(wethBalance, 18)).toFixed(4),
        LINK: parseFloat(ethers.formatUnits(linkBalance, 18)).toFixed(4),
        ETH: parseFloat(ethers.formatEther(ethBalance)).toFixed(4),
        DAI: parseFloat(ethers.formatUnits(daiBalance, 18)).toFixed(4),
      });
      setLoadingBalances(false);
    } catch (error) {
      toast({
        title: "Error loading balances",
        description: error.message,
        status: "error",
        duration: 2500,
        isClosable: true,
      });
      setLoadingBalances(false);
    }
  };

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
    if (tokensIn.length < 2) {
      setTokensIn([...tokensIn, { token: "", amount: "" }]);
    }
  };

  const getAvailableTokens = (index) => {
    const selectedTokens = tokensIn.map((token) => token.token);
    const allTokens = ["WETH", "USDC", "LINK", "DAI"];
    return allTokens.filter(
      (token) =>
        !selectedTokens.includes(token) || token === tokensIn[index].token
    );
  };

  const getUnselectedTokens = () => {
    const selectedTokens = tokensIn.map((token) => token.token);
    const allTokens = ["WETH", "USDC", "LINK", "DAI"];
    return allTokens.filter((token) => !selectedTokens.includes(token));
  };

  return (
    <Box
      maxW="md"
      mx="auto"
      mt="10"
      px={1}
      py={9}
      bg="gray.700"
      color="white"
      rounded="xl"
      shadow="2xl"
      border="1px"
      borderColor="gray.600"
    >
      {tokensIn.map((token, index) => (
        <Box
          key={index}
          mb="4"
          p="6"
          bg="gray.800"
          rounded="xl"
          shadow="md"
          border="1px"
          borderColor="gray.600"
          mx={4}
        >
          <Box
            bg="blue.700"
            rounded="lg"
            px="2"
            display="inline-block"
            color="white"
            size="sm"
            mb={2}
          >
            <Text fontSize="sm">{token.token}</Text>
          </Box>

          {isConnected && (
            <StatGroup mb={2}>
              <Stat>
                <StatLabel>Balance</StatLabel>
                <Skeleton
                  isLoaded={!loadingBalances}
                  rounded={6}
                  width="max-content"
                >
                  <StatNumber>{balances[token.token] || "0.0"}</StatNumber>
                </Skeleton>
              </Stat>
              <Stat>
                <StatLabel>Price</StatLabel>
                <Skeleton
                  isLoaded={!loadingBalances}
                  rounded={6}
                  width="max-content"
                >
                  <StatNumber>
                    {`$${(
                      balances[token.token] *
                      (token.token === "DAI"
                        ? prices["USDC"]
                        : prices[token.token === "WETH" ? "ETH" : token.token])
                    ).toFixed(2)}` || "0"}
                  </StatNumber>
                </Skeleton>
              </Stat>
            </StatGroup>
          )}

          <HStack>
            <Select
              value={token.token}
              onChange={(e) => handleTokenChange(e.target.value, index)}
              borderColor="blue.500"
              bg="gray.700"
              flex="1"
              marginRight={5}
              rounded="xl"
            >
              {getAvailableTokens(index).map((availableToken) => (
                <option key={availableToken} value={availableToken}>
                  {availableToken}
                </option>
              ))}
            </Select>
            <Input
              type="number"
              placeholder="0.0"
              value={token.amount}
              onChange={(e) => handleAmountChange(e.target.value, index)}
              borderColor="transparent"
              bg="gray.700"
              color="white"
              flex="1"
              _placeholder={{ color: "gray.500" }}
              fontSize="xl"
              rounded="xl"
              mx={8}
            />
          </HStack>
        </Box>
      ))}
      {tokensIn.length < 2 && (
        <Flex justifyContent="center" mt="3">
          <Button
            onClick={addTokenInput}
            rounded="xl"
            bg="blue.600"
            _hover={{ bg: "blue.500" }}
            width="50%"
            size="md"
          >
            Add Token
          </Button>
        </Flex>
      )}

      <Box
        mt="4"
        p="6"
        bg="gray.800"
        rounded="xl"
        border="1px"
        borderColor="gray.600"
        mx={4}
      >
        <Text mb="2" fontSize="lg">
          Buy Token :
        </Text>
        <HStack>
          <Select
            value={tokenOut}
            onChange={(e) => setTokenOut(e.target.value)}
            borderColor="blue.500"
            bg="gray.700"
            flex="1"
            rounded="xl"
            marginRight={5}
          >
            {getUnselectedTokens().map((availableToken) => (
              <option key={availableToken} value={availableToken}>
                {availableToken}
              </option>
            ))}
          </Select>
          <Input
            flex="1"
            type="number"
            placeholder="0.0"
            borderColor="transparent"
            bg="gray.700"
            color="white"
            value={tokensIn[0].amount}
            onChange={(e) => handleAmountChange(e.target.value, 0)}
            _placeholder={{ color: "gray.500" }}
            fontSize="xl"
            rounded="xl"
            mx={8}
          />
        </HStack>
      </Box>

      <Flex justifyContent="center" mt="4">
        <Button
          bg="pink.500"
          px="5"
          color="white"
          _hover={{ bg: "pink.400" }}
          onClick={
            isConnected
              ? () => toast({ title: "Swapping...", status: "info" })
              : connectWallet
          }
          isLoading={loading}
          loadingText="Connecting"
          colorScheme="pink"
          rounded="xl"
          size="md"
        >
          {isConnected
            ? tokensIn.length == 2
              ? "MultiHop Swap"
              : "Swap"
            : "Connect To"}
        </Button>
      </Flex>
    </Box>
  );
};

export default SwapComponent;
