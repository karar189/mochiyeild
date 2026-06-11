import deployment from './deployments.json'

export type PublicContractAddresses = {
  hook: string
  vault: string
  ptToken: string
  ytToken: string
}

/** Prefer NEXT_PUBLIC_* on Vercel; fall back to deployments.json (local Anvil). */
export function getPublicDeployment(): {
  chainId: number
  addresses: PublicContractAddresses
} {
  const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || deployment.chainId

  return {
    chainId,
    addresses: {
      hook: process.env.NEXT_PUBLIC_HOOK ?? deployment.addresses.hook,
      vault: process.env.NEXT_PUBLIC_VAULT ?? deployment.addresses.vault,
      ptToken: process.env.NEXT_PUBLIC_PT_TOKEN ?? deployment.addresses.ptToken,
      ytToken: process.env.NEXT_PUBLIC_YT_TOKEN ?? deployment.addresses.ytToken,
    },
  }
}
