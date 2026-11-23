import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import type { ProfileRow } from "@/lib/supabase/database.types";

async function listProfiles(): Promise<ProfileRow[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  return data ?? [];
}

export default async function AdminUsersPage() {
  const profiles = await listProfiles();

  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-offwhite">Pengguna</h1>
      <div className="mt-5 overflow-x-auto rounded-2xl border border-border-subtle">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="bg-surface text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Admin</th>
              <th className="px-4 py-3">Bergabung</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => (
              <tr key={p.id} className="border-t border-border-subtle">
                <td className="px-4 py-3 font-medium text-offwhite">{p.username}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.is_admin ? "Ya" : "Tidak"}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(p.created_at)}</td>
              </tr>
            ))}
            {profiles.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                  Belum ada pengguna terdaftar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Untuk memberi hak admin, jalankan SQL: update profiles set is_admin =
        true where username = &apos;...&apos;.
      </p>
    </div>
  );
}
