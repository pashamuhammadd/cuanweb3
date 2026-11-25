"use client";

import { useActionState } from "react";
import { updateProfile, type UpdateProfileState } from "@/lib/actions/profile";
import type { ProfileRow } from "@/lib/supabase/database.types";

const initialState: UpdateProfileState = { status: "idle" };

export function ProfileForm({ profile }: { profile: ProfileRow }) {
  const [state, formAction, isPending] = useActionState(updateProfile, initialState);

  return (
    <form action={formAction} className="card-surface space-y-5 p-4 md:p-5">
      <div>
        <label htmlFor="username" className="text-sm font-medium text-offwhite">
          Username
        </label>
        <input
          id="username"
          name="username"
          defaultValue={profile.username}
          className="mt-1.5 h-11 w-full rounded-xl border border-border-subtle bg-surface-raised px-3 text-sm text-offwhite focus:border-champagne/60"
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
          className="mt-1.5 h-11 w-full rounded-xl border border-border-subtle bg-surface-raised px-3 text-sm text-offwhite placeholder:text-muted-foreground focus:border-champagne/60"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-offwhite">
        <input
          type="checkbox"
          name="notificationOptIn"
          defaultChecked={profile.notification_opt_in}
          className="h-4 w-4 rounded border-border-subtle bg-surface-raised accent-gold"
        />
        Kirim notifikasi deadline & campaign ke email saya
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="press h-11 rounded-xl bg-gold px-5 text-sm font-semibold text-charcoal disabled:opacity-60"
        >
          {isPending ? "Menyimpan…" : "Simpan perubahan"}
        </button>
        {state.status !== "idle" && (
          <span
            role="status"
            className={state.status === "ok" ? "text-sm text-emerald-300" : "text-sm text-rose-300"}
          >
            {state.message}
          </span>
        )}
      </div>
    </form>
  );
}
