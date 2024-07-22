import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from "sonner";

const WalletContext = createContext();

const POLYGON_AMOY_CHAIN_ID = '0x13882'; // Hexadecimal -> 80002
const POLYGON_AMOY_RPC_URL = 'https://rpc-amoy.polygon.technology/';

export const WalletProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    try {
      setLoading(true);
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        
        const polygonAmoyChainId = BigInt(POLYGON_AMOY_CHAIN_ID);

        if (network.chainId !== polygonAmoyChainId) {
          console.log("Detected network.chainId:", network.chainId, "Expected:", polygonAmoyChainId);
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: POLYGON_AMOY_CHAIN_ID,
              chainName: 'Polygon Amoy Testnet',
              rpcUrls: [POLYGON_AMOY_RPC_URL],
              nativeCurrency: {
                name: 'MATIC',
                symbol: 'MATIC',
                decimals: 18,
              },
              blockExplorerUrls: ['https://amoy.polygonscan.com/'],
            }],
          });
          toast.success('Switched to Polygon Amoy Testnet');
        }

        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setWalletAddress(address);
        setIsConnected(true);
        toast.success('Wallet connected successfully');
      } else {
        toast.error('Please install MetaMask!');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast.error('Failed to connect wallet');
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
        } else {
          setIsConnected(false);
          setWalletAddress('');
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
