"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ProfileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Minimal 3 karakter")
    .max(24, "Maksimal 24 karakter")
    .regex(/^[a-z0-9_-]+$/i, "Hanya huruf, angka, - dan _"),
  skillTags: z.string().optional(),
  notificationOptIn: z.boolean(),
});

export type UpdateProfileState = {
  status: "idle" | "ok" | "error";
  message?: string;
};

export async function updateProfile(
  _prev: UpdateProfileState,
  formData: FormData,
): Promise<UpdateProfileState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Sesi tidak ditemukan, silakan masuk kembali." };
  }

  const parsed = ProfileSchema.safeParse({
    username: formData.get("username"),
    skillTags: formData.get("skillTags")?.toString() ?? "",
    notificationOptIn: formData.get("notificationOptIn") === "on",
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const skillTags = parsed.data.skillTags
    ? parsed.data.skillTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const { error } = await supabase
    .from("profiles")
    .update({
      username: parsed.data.username,
      skill_tags: skillTags,
      notification_opt_in: parsed.data.notificationOptIn,
    })
    .eq("id", user.id);

  if (error) {
    const message = error.code === "23505" ? "Username sudah dipakai." : error.message;
    return { status: "error", message };
  }

  revalidatePath("/akun");
  return { status: "ok", message: "Profil tersimpan." };
}
