import { useWallet } from "../contexts/useWallet";
import {
  Box,
  Button,
  Image,
  Link,
  Spinner,
  Badge,
  Stack,
  Flex,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";

const HeaderComponent = () => {
  const { connectWallet, isConnected, walletAddress, loading } = useWallet();

  const truncateAddress = (address) => {
    if (!address) return "null";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const stackDirection = useBreakpointValue({ base: "column", md: "row" });

  return (
    <Box bg="gray.800" p={[2, 4]} color="white">
      <Flex align="center" justify="space-between" maxW="1200px" mx="auto">
        <Stack direction={stackDirection} align="center" spacing={5}>
          <Link
            href="/home"
            display="flex"
            mr="5"
            _hover={{ color: "gray.300" }}
            alignItems="center"
          >
            <Image
              src="/switch.png"
              alt="Logo"
              boxSize={["6", "6"]}
              mr={["0", "2"]}
            />
            <Text display={["none", "block"]}>ArthaSwap</Text>
          </Link>
          <Link
            href="https://staging.aave.com/faucet/"
            isExternal
            target="_blank"
            rel="noopener noreferrer"
            _hover={{ color: "gray.300" }}
          >
            Faucet
          </Link>
          <Link href="#" _hover={{ color: "gray.300" }}>
            Pool
          </Link>
          <Link href="#" _hover={{ color: "gray.300" }}>
            Explore
          </Link>
        </Stack>

        <Stack direction={stackDirection} align="center" spacing="4">
          {isConnected && (
            <Stack direction="row" align="center" spacing="2">
              <Badge rounded="md" px="3" py="1">
                Sepolia Testnet
              </Badge>
              <Image
                src="/eth.png"
                alt="Logo"
                boxSize={["6", "8"]}
              />
            </Stack>
          )}
          <Button
            onClick={connectWallet}
            bg="pink.500"
            _hover={{ bg: "pink.400" }}
            px="5"
            py="2"
            rounded="xl"
            size="md"
            disabled={loading}
            rightIcon={loading ? <Spinner size="sm" color="white" /> : null}
          >
            {loading
              ? "Connecting"
              : isConnected
              ? truncateAddress(walletAddress)
              : "Connect"}
          </Button>
        </Stack>
      </Flex>
    </Box>
  );
};

export default HeaderComponent;
