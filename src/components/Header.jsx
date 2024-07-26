import { useWallet } from "../contexts/useWallet";
import {
  Flex,
  Button,
  Image,
  Box,
  Link,
  Spinner,
  Text,
  Badge
} from "@chakra-ui/react";

const HeaderComponent = () => {
  const { connectWallet, isConnected, walletAddress, loading } = useWallet();

  const truncateAddress = (address) => {
    if (!address) return "null";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Box bg="gray.800" p="4" color="white">
      <Flex align="center" justify="space-between" maxW="1200px" mx="auto">
        <Flex align="center" gap="5">
          <Link
            href="/home"
            display="flex"
            _hover={{ color: "gray.300" }}
            alignItems="center"
          >
            <Image src="/src/assets/switch.png" alt="Logo" boxSize="6" mr="2" />
            ArthaSwap
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
        </Flex>

        <Flex align="center">
          {isConnected && (
            <Flex align="center">
              <Badge rounded="md" px="3" py="1">Sepolia Testnet</Badge>
              <Image
                className="arrow-animation"
                src="/src/assets/eth.png"
                alt="Logo"
                boxSize="8"
                mr="4"
                ml="2"
              />
            </Flex>
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
        </Flex>
      </Flex>
    </Box>
  );
};

export default HeaderComponent;
