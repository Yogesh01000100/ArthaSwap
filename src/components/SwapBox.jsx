import { useState, useEffect } from "react";
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
  CloseButton,
} from "@chakra-ui/react";
import ERC20ABI from "../contracts/abis/abi.json";
import { subscribeToPrice, unsubscribeFromPrice } from "../utils/wsHelper";
import { WETH, USDC, DAI, LINK } from "../constants/tokens";
import {
  executeSingleTokenSwap,
  executeMultihopTokenSwap,
} from "../utils/swapUtil";

const SwapComponent = () => {
  const [tokensIn, setTokensIn] = useState([{ token: "WETH", amount: "" }]);
  const [tokenOut, setTokenOut] = useState("USDC");
  const [isSwapping, setIsSwapping] = useState(false);
  const [tokenOutAmount, setTokenOutAmount] = useState("");
  const tokenDetails = { WETH, USDC, DAI, LINK };
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
        status: "error",
        duration: 2500,
        isClosable: true,
        variant: "subtle",
        position: "top",
      });
      setLoadingBalances(false);
    }
  };

  const handleTokenOutAmountChange = (value) => {
    setTokenOutAmount(value);
  };

  const handleTokenChange = (value, index) => {
    const newTokensIn = [...tokensIn];
    newTokensIn[index].token = value;
    setTokensIn(newTokensIn);
    updateTokenOut();
  };

  const handleAmountChange = (value, index) => {
    const newTokensIn = [...tokensIn];
    newTokensIn[index].amount = value;
    setTokensIn(newTokensIn);
  };

  const addTokenInput = () => {
    if (tokensIn.length < 2) {
      const allTokens = ["WETH", "USDC", "LINK", "DAI"];
      const currentTokens = tokensIn.map((token) => token.token);
      let nextTokenIndex = allTokens.findIndex(
        (token) => !currentTokens.includes(token)
      );
      if (nextTokenIndex === -1) {
        nextTokenIndex = 0;
      }

      const newToken = { token: allTokens[nextTokenIndex], amount: "" };
      setTokensIn([...tokensIn, newToken]);
      updateTokenOut();
    }
  };

  const removeTokenInput = (index) => {
    const updatedTokens = tokensIn.filter((_, i) => i !== index);
    setTokensIn(updatedTokens);
    updateTokenOut();
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

  const updateTokenOut = () => {
    const unselectedTokens = getUnselectedTokens();
    if (unselectedTokens.length > 0) {
      setTokenOut(unselectedTokens[0]);
    }
  };

  const performSwap = async () => {
    if (tokensIn.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please enter the token amounts.",
        status: "error",
        duration: 3000,
        isClosable: true,
        variant: "subtle",
        position: "top",
      });
      return;
    }
    setIsSwapping(true);

    try {
      let receipt;
      if (tokensIn.length > 1) {
        const pathTokens = tokensIn.map((token) => tokenDetails[token.token]);
        const amountIn = tokensIn[0].amount;
        receipt = await executeMultihopTokenSwap(
          pathTokens[0],
          pathTokens[1],
          tokenDetails[tokenOut],
          amountIn.toString()
        );
      } else {
        const amountIn = tokensIn[0].amount;
        const tokenInDetails = tokenDetails[tokensIn[0].token];
        const tokenOutDetails = tokenDetails[tokenOut];

        receipt = await executeSingleTokenSwap(
          amountIn,
          tokenInDetails,
          tokenOutDetails
        );
      }
      await loadBalances();
      toast({
        title: "Swap successful",
        description: `Transaction hash: ${receipt.hash.slice(
          0,
          9
        )}......${receipt.hash.slice(-6)}`,
        status: "success",
        duration: 4000,
        isClosable: true,
        variant: "subtle",
        position: "top",
      });
    } catch (error) {
      console.error("Swap failed:", error);
      toast({
        title: "Swap failed",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        variant: "subtle",
        position: "top",
      });
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <Box
      maxW={["92%", "md"]}
      mx="auto"
      mt={["4", "10"]}
      p={["2", "4"]}
      py="3"
      bg="gray.700"
      color="white"
      rounded="xl"
      shadow="2xl"
      border="1px"
      borderColor="blue.600"
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
          borderColor="blue.600"
          mx="auto"
          position="relative"
        >
          {tokensIn.length > 1 && (
            <CloseButton
              position="absolute"
              right="1"
              top="1"
              color="gray.500"
              onClick={() => removeTokenInput(index)}
            />
          )}
          <Box
            bg="blue.700"
            rounded="lg"
            px="2"
            display="inline-block"
            color="white"
            size="sm"
            mb="2"
          >
            <Text fontSize={["xs", "sm"]}>{token.token}</Text>
          </Box>

          {isConnected && (
            <StatGroup mb="2">
              <Stat>
                <StatLabel>Balance</StatLabel>
                <Skeleton
                  isLoaded={!loadingBalances}
                  rounded="md"
                  width="max-content"
                >
                  <StatNumber>{balances[token.token] || "0.0"}</StatNumber>
                </Skeleton>
              </Stat>
              <Stat>
                <StatLabel>Price</StatLabel>
                <Skeleton
                  isLoaded={!loadingBalances}
                  rounded="md"
                  width="max-content"
                >
                  <StatNumber>
                    {`$${(
                      balances[token.token] *
                      (token.token === "DAI"
                        ? prices["USDC"]
                        : prices[token.token === "WETH" ? "ETH" : token.token])
                    ).toFixed(2)}` || "$0.00"}
                  </StatNumber>
                </Skeleton>
              </Stat>
            </StatGroup>
          )}

          <HStack spacing={3}>
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
              fontSize={["sm", "xl"]}
              rounded="xl"
            />
          </HStack>
        </Box>
      ))}
      {tokensIn.length < 2 && (
        <Flex justifyContent="center" mt="3">
          <Button
            onClick={addTokenInput}
            rounded="2xl"
            bg="pink.600"
            _hover={{ bg: "pink.500" }}
            width={["80%", "40%"]}
            size="md"
            isDisabled={!isConnected}
          >
            Add Token
          </Button>
        </Flex>
      )}

      <Box
        mt="4"
        p="6"
        bg="blue.800"
        rounded="xl"
        border="1px"
        borderColor="blue.600"
        mx={4}
      >
        <Text mb="2" fontSize={["md", "lg"]}>
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
            bg="gray.700"
            color="white"
            value={tokenOutAmount}
            onChange={(e) => handleTokenOutAmountChange(e.target.value)}
            _placeholder={{ color: "gray.500" }}
            fontSize={["sm", "xl"]}
            rounded="xl"
            border="1px"
            borderColor="blue.600"
          />
        </HStack>
        {isConnected && (
          <StatGroup mt="2">
            <Stat>
              <StatLabel>Balance</StatLabel>
              <Skeleton
                isLoaded={!loadingBalances}
                rounded="md"
                width="max-content"
              >
                <StatNumber>{balances[tokenOut] || "0.0"}</StatNumber>
              </Skeleton>
            </Stat>
            <Stat>
              <StatLabel>Price</StatLabel>
              <Skeleton
                isLoaded={!loadingBalances}
                rounded="md"
                width="max-content"
              >
                <StatNumber>
                  {`$${(
                    balances[tokenOut] *
                    (tokenOut === "DAI"
                      ? prices["USDC"]
                      : prices[tokenOut === "WETH" ? "ETH" : tokenOut])
                  ).toFixed(2)}` || "$0.00"}
                </StatNumber>
              </Skeleton>
            </Stat>
          </StatGroup>
        )}
      </Box>

      <Flex justifyContent="center" mt="4" mb="1">
        <Button
          onClick={() => {
            if (!isConnected) {
              connectWallet();
            } else {
              performSwap();
            }
          }}
          isLoading={loading || isSwapping}
          loadingText={isSwapping ? "Swapping..." : "Connecting"}
          colorScheme="pink"
          rounded="2xl"
          size="md"
          px="9"
          textColor="white"
          isDisabled={!isConnected}
          bg={!isConnected ? "pink.400" : "pink.500"}
          _hover={{ bg: !isConnected ? "pink.400" : "pink.400" }}
        >
          {tokensIn.length > 1 ? "Multi-hop Swap" : "Swap"}
        </Button>
      </Flex>
    </Box>
  );
};

export default SwapComponent;
