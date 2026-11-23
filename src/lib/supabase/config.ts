export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * True hanya ketika kredensial Supabase publik tersedia. Dipakai untuk memilih
 * antara data source Supabase (produksi) dan seed data lokal berlabel (mode
 * pengembangan tanpa kredensial), bukan untuk memverifikasi keamanan apa pun.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
