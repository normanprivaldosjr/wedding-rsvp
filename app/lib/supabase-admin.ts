import "server-only";
import { createClient } from "@supabase/supabase-js";

// Uses the service role key to bypass RLS — only safe server-side.
// Add SUPABASE_SERVICE_ROLE_KEY to .env from Supabase → Project Settings → API.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);
