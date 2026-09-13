import { createClient } from "@supabase/supabase-js";

// These come from your Supabase project settings (Project Settings → API).
// The anon key is safe to expose publicly — it's designed for this, the
// same way Firebase's config object was. Actual access control is
// enforced server-side by the Row Level Security policies in
// supabase-schema.sql, not by keeping this key secret.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and " +
    "NEXT_PUBLIC_SUPABASE_ANON_KEY — see SETUP-NOTES.md."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
