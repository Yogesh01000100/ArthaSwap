import { useWallet } from "../contexts/useWallet";
import ClipLoader from "react-spinners/ClipLoader";

const HeaderComponent = () => {
  const { connectWallet, isConnected, walletAddress, loading } = useWallet();

  const truncateAddress = (address) => {
    if (!address) return "null";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="text-white p-4">
      <div className="container mx-auto flex items-center">
        <div className="flex space-x-7 items-center">
          <a
            href="/home"
            className="hover:text-gray-300 mr-5 flex items-center"
          >
            <img
              src="/src/assets/switch.png"
              alt="Logo"
              className="w-6 h-6 mr-2"
            />
            MULTISWAP
          </a>
          <a href="#" className="hover:text-gray-300">
            Trade
          </a>
          <a href="#" className="hover:text-gray-300">
            Explore
          </a>
          <a href="#" className="hover:text-gray-300">
            Pool
          </a>
        </div>
        <button
          onClick={connectWallet}
          className="ml-auto bg-pink-600 hover:bg-pink-500 px-5 py-2 rounded-xl"
          disabled={loading}
        >
          {loading ? (
            <ClipLoader size={24} color={"#fff"} loading={loading} />
          ) : isConnected ? (
            truncateAddress(walletAddress)
          ) : (
            "Connect"
          )}
        </button>
      </div>
    </div>
  );
};

export default HeaderComponent;
