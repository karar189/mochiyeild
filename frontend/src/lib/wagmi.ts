import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, localhost } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

// Anvil local chain configuration
const anvil = {
  id: 31337,
  name: 'Anvil',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
  },
} as const

// Unichain Sepolia — origin chain for Mochi testnet deployment
const unichainSepolia = {
  id: 1301,
  name: 'Unichain Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://sepolia.unichain.org'] },
  },
} as const

export const config = createConfig({
  chains: [unichainSepolia, anvil, sepolia, mainnet, localhost],
  // EIP-6963 auto-discovers MetaMask, Phantom, Brave Wallet, etc.
  // Avoid metaMask() SDK connector — it blocks the extension popup path.
  connectors: [injected({ shimDisconnect: true })],
  transports: {
    [unichainSepolia.id]: http('https://sepolia.unichain.org'),
    [anvil.id]: http(),
    [sepolia.id]: http(),
    [mainnet.id]: http(),
    [localhost.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
