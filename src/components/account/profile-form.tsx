"use client";

import { useActionState } from "react";
import { updateProfile, type UpdateProfileState } from "@/lib/actions/profile";
import type { ProfileRow } from "@/lib/supabase/database.types";

const initialState: UpdateProfileState = { status: "idle" };

export function ProfileForm({ profile }: { profile: ProfileRow }) {
  const [state, formAction, isPending] = useActionState(updateProfile, initialState);

  return (
    <form action={formAction} className="space-y-5 rounded-2xl border border-border-subtle bg-surface p-5">
      <div>
        <label htmlFor="username" className="text-sm font-medium text-offwhite">
          Username
        </label>
        <input
          id="username"
          name="username"
          defaultValue={profile.username}
          className="mt-1.5 w-full rounded-lg border border-border-subtle bg-surface-raised px-3 py-2 text-sm text-offwhite focus:border-teal focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="skillTags" className="text-sm font-medium text-offwhite">
          Skill (pisahkan dengan koma)
        </label>
        <input
          id="skillTags"
          name="skillTags"
          defaultValue={profile.skill_tags?.join(", ") ?? ""}
          placeholder="desain, developer, menulis"
          className="mt-1.5 w-full rounded-lg border border-border-subtle bg-surface-raised px-3 py-2 text-sm text-offwhite placeholder:text-muted-foreground focus:border-teal focus:outline-none"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-offwhite">
        <input
          type="checkbox"
          name="notificationOptIn"
          defaultChecked={profile.notification_opt_in}
          className="h-4 w-4 rounded border-border-subtle bg-surface-raised accent-teal"
        />
        Kirim notifikasi deadline & campaign ke email saya
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-charcoal transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
        >
          {isPending ? "Menyimpan…" : "Simpan perubahan"}
        </button>
        {state.status !== "idle" && (
          <span
            className={state.status === "ok" ? "text-sm text-emerald-400" : "text-sm text-rose-400"}
          >
            {state.message}
          </span>
        )}
      </div>
    </form>
  );
}
