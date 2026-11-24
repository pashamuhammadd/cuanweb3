import type { SourceAdapter } from "../types";
import { devpostAdapter } from "./devpost";
import { rssAdapter } from "./rss";
import { web3CareerAdapter } from "./web3career";

/**
 * Registry adapter. Menambah sumber baru = tulis adapter yang mengembalikan
 * RawItem[] lalu daftarkan di sini; baris integration_sources.adapter memilihnya.
 * Sumber dengan adapter "none" hanya terdaftar sebagai integrasi opsional.
 */
export const ADAPTERS: Record<string, SourceAdapter> = {
  [rssAdapter.key]: rssAdapter,
  [web3CareerAdapter.key]: web3CareerAdapter,
  [devpostAdapter.key]: devpostAdapter,
};

export function getAdapter(key: string): SourceAdapter | null {
  return ADAPTERS[key] ?? null;
}
