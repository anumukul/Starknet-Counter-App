import { Chain } from "@starknet-react/chains";
import { supportedChains as chains } from "./supportedChains";

export type ScaffoldConfig = {
  targetNetworks: readonly Chain[];
  pollingInterval: number;
  onlyLocalBurnerWallet: boolean;
  walletAutoConnect: boolean;
  autoConnectTTL: number;
};

const scaffoldConfig = {
  // Change from devnet to sepolia for production deployment
  targetNetworks: [chains.sepolia],
  
  // Disable burner wallet for testnet (users should use real wallets)
  onlyLocalBurnerWallet: false,
  
  // Increase polling interval for testnet (sepolia is slower than devnet)
  pollingInterval: 10_000,
  
  /**
   * Auto connect:
   * 1. If the user was connected into a wallet before, on page reload reconnect automatically
   * 2. If user is not connected to any wallet: On reload, connect to burner wallet if burnerWallet.enabled is true && burnerWallet.onlyLocal is false
   */
  autoConnectTTL: 60000,
  walletAutoConnect: true,
} as const satisfies ScaffoldConfig;

export default scaffoldConfig;