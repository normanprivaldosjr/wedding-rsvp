"use server";

import { redirect } from "next/navigation";
import { createSession, deleteSession } from "@/app/lib/session";

const ADMIN_USERNAME = "normanruby";
const ADMIN_PASSWORD = "aug282026";

export type LoginState = { error: string } | null;

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const username = formData.get("username")?.toString().trim() ?? "";
  const password = formData.get("password")?.toString() ?? "";

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return { error: "Incorrect username or password." };
  }

  await createSession();
  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/dashboard/login");
}
