import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useToast } from '@chakra-ui/react';

const WalletContext = createContext();

const ETH_SEPOLIA_CHAIN_ID = '0xaa36a7'; // Hexadecimal -> 11155111
const ETH_SEPOLIA_RPC = 'https://rpc.sepolia.org';

export const WalletProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

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
                toast({
                  title: 'Network Switched',
                  description: 'Switched to Ethereum Sepolia Testnet',
                  status: 'success',
                  duration: 4000,
                  isClosable: true,
                });
              } catch (addError) {
                console.error('Failed to add network:', addError);
                toast({
                  title: 'Network Addition Failed',
                  description: 'Failed to add Sepolia network',
                  status: 'error',
                  duration: 5000,
                  isClosable: true,
                });
                return;
              }
            } else {
              console.error('Failed to switch network:', switchError);
              toast({
                title: 'Network Switch Failed',
                description: 'Failed to switch to Sepolia network',
                status: 'error',
                duration: 5000,
                isClosable: true,
              });
              return;
            }
          }
        }

        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setWalletAddress(address);
        sessionStorage.setItem('walletAddress', address);
        setIsConnected(true);
        toast({
          title: 'Wallet Connected',
          description: 'Wallet connected successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'MetaMask Not Found',
          description: 'Please install MetaMask!',
          status: 'error',
          duration: 5000,
          isClosable: true,
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
      });
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedAddress = sessionStorage.getItem('walletAddress');
    if (storedAddress) {
      setWalletAddress(storedAddress);
      setIsConnected(true);
    }
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          sessionStorage.setItem('walletAddress', accounts[0]);
          setIsConnected(true);
        } else {
          setIsConnected(false);
          setWalletAddress('');
          sessionStorage.removeItem('walletAddress');
        }
      });
    }
  }, []);

  return (
    <WalletContext.Provider value={{ connectWallet, isConnected, walletAddress, loading }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  return useContext(WalletContext);
};