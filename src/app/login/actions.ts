"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import type { ActionState } from "@/components/form-helpers";

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirectTo: "/dashboard",
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, message: "Invalid email or password." };
    }
    throw error; // let Next.js handle the redirect
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
