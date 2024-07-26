import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useToast } from '@chakra-ui/react';

const WalletContext = createContext();

const ETH_SEPOLIA_CHAIN_ID = '0xaa36a7'; // Hexadecimal -> 11155111
const ETH_SEPOLIA_RPC = 'https://rpc.sepolia.org';

export const WalletProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(sessionStorage.getItem('isConnected') === 'true');
  const [walletAddress, setWalletAddress] = useState(sessionStorage.getItem('walletAddress') || '');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    sessionStorage.setItem('isConnected', isConnected);
    sessionStorage.setItem('walletAddress', walletAddress);
  }, [isConnected, walletAddress]);

  const connectWallet = async () => {
    try {
      setLoading(true);
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();

        const ethSepoliaChainId = BigInt(ETH_SEPOLIA_CHAIN_ID);

        if (network.chainId !== ethSepoliaChainId) {
          console.log("Detected network.chainId:", network.chainId, "Expected:", ethSepoliaChainId);

          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: ETH_SEPOLIA_CHAIN_ID }],
            });
          } catch (switchError) {
            if (switchError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: ETH_SEPOLIA_CHAIN_ID,
                    chainName: 'Sepolia Testnet',
                    rpcUrls: [ETH_SEPOLIA_RPC],
                    nativeCurrency: {
                      name: 'SepoliaETH',
                      symbol: 'ETH',
                      decimals: 18,
                    },
                    blockExplorerUrls: ['https://sepolia.etherscan.io/'],
                  }],
                });
              } catch (addError) {
                console.error('Failed to add network:', addError);
                return;
              }
            } else {
              console.error('Failed to switch network:', switchError);
              return;
            }
          }
        }

        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setIsConnected(true);
        setWalletAddress(address);
        toast({
          title: 'Wallet Connected',
          description: 'Wallet connected successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
          variant: 'subtle',
          position: "top"
        });
      } else {
        toast({
          title: 'MetaMask Not Found',
          description: 'Please install MetaMask!',
          status: 'error',
          isClosable: true,
          variant: 'subtle',
          duration: 5000,
          position: "top"
        });
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect wallet',
        status: 'error',
        duration: 5000,
        isClosable: true,
        variant: 'subtle',
        position: "top"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <WalletContext.Provider value={{ connectWallet, isConnected, walletAddress, loading }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  return useContext(WalletContext);
};