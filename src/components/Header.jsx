import { useWallet } from "../contexts/useWallet";
import { Flex, Button, Image, Box, Link, Spinner} from '@chakra-ui/react';

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
          <Link href="/home" display="flex" _hover={{ color: 'gray.300' }} alignItems="center">
            <Image src="/src/assets/switch.png" alt="Logo" boxSize="6" mr="2" />
            ArthaSwap
          </Link>
          <Link href="#" _hover={{ color: 'gray.300' }}>Trade</Link>
          <Link href="#" _hover={{ color: 'gray.300' }}>Explore</Link>
          <Link href="#" _hover={{ color: 'gray.300' }}>Pool</Link>
        </Flex>
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
          {loading ? 'Connecting' : isConnected ? truncateAddress(walletAddress) : 'Connect'}
        </Button>
      </Flex>
    </Box>
  );
};

export default HeaderComponent;
