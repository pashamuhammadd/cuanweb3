import type { OpportunityCategory, RewardCertainty } from "@/lib/supabase/database.types";

/** Label kategori tanpa dependensi UI — dipakai engine, admin, dan halaman publik. */
export const CATEGORY_LABELS: Record<OpportunityCategory, string> = {
  airdrop: "Airdrop",
  giveaway: "Giveaway",
  bounty: "Bounty",
  contest: "Kontes Web3",
  jobs: "Web3 Jobs",
  hackathon: "Hackathon",
  grants: "Grants",
  testnet: "Testnet",
  ambassador: "Ambassador Program",
  paid_mission: "Misi Berbayar",
};

/** URL halaman kategori publik. */
export const CATEGORY_HREFS: Record<OpportunityCategory, string> = {
  airdrop: "/airdrop",
  giveaway: "/giveaway",
  bounty: "/bounty",
  contest: "/kontes",
  jobs: "/jobs",
  hackathon: "/hackathon",
  grants: "/grants",
  testnet: "/testnet",
  ambassador: "/ambassador",
  paid_mission: "/misi-berbayar",
};

export const REWARD_CERTAINTY_LABELS: Record<RewardCertainty, string> = {
  guaranteed: "Bayaran pasti (sesuai sumber)",
  competition: "Hadiah kompetisi — hanya untuk pemenang",
  raffle: "Hadiah undian — tidak semua peserta menang",
  unconfirmed: "Reward belum dikonfirmasi",
  unknown: "Belum diketahui",
};

export const ECOSYSTEM_LABELS: Record<string, string> = {
  solana: "Solana",
  ethereum: "Ethereum",
  base: "Base",
  "bnb-chain": "BNB Chain",
  polygon: "Polygon",
  arbitrum: "Arbitrum",
  optimism: "Optimism",
  sui: "Sui",
  aptos: "Aptos",
  cardano: "Cardano",
  avalanche: "Avalanche",
  near: "NEAR",
  ton: "TON",
  cosmos: "Cosmos",
  starknet: "Starknet",
  zksync: "zkSync",
  bitcoin: "Bitcoin",
};

export function ecosystemLabel(key: string): string {
  return ECOSYSTEM_LABELS[key] ?? key;
}
