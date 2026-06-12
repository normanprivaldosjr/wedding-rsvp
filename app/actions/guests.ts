"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/app/lib/supabase-admin";

export type AddGuestState = { error: string } | { success: true } | null;

function generateInvitationCode(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-");
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${slug}-${suffix}`;
}

export async function addGuest(
  _prevState: AddGuestState,
  formData: FormData
): Promise<AddGuestState> {
  const name = formData.get("primary_guest_name")?.toString().trim() ?? "";
  const maxGuests = parseInt(formData.get("max_guests")?.toString() ?? "1", 10);
  const group = formData.get("guest_group")?.toString().trim() || null;

  if (!name) return { error: "Guest name is required." };
  if (isNaN(maxGuests) || maxGuests < 1 || maxGuests > 20) {
    return { error: "Max guests must be between 1 and 20." };
  }

  const invitation_code = generateInvitationCode(name);

  const { error } = await supabaseAdmin.from("guests").insert({
    primary_guest_name: name,
    max_guests: maxGuests,
    guest_group: group,
    invitation_code,
  });

  if (error) return { error: "Failed to add guest. Please try again." };

  revalidatePath("/dashboard");
  return { success: true };
}
