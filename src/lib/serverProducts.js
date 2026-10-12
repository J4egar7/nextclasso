import { createClient } from "@supabase/supabase-js";
import { PUBLIC_COLUMNS, mapRowToProduct } from "./productMapper.js";

// Runs on the server (during build / revalidation), so the HTML a visitor
// receives already contains the real catalog instead of an empty page that
// fills in after JavaScript loads. Returns null on any failure so the
// browser can fall back to its own fetch.
export async function getPublicProducts() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  try {
    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (u, o) => fetch(u, { ...o, signal: AbortSignal.timeout(8000) }) },
    });
    const { data, error } = await client
      .from("products")
      .select(PUBLIC_COLUMNS)
      .order("created_at", { ascending: false });
    if (error) { console.error("Server product fetch failed:", error.message); return null; }
    return (data || []).map(mapRowToProduct);
  } catch (e) {
    console.error("Server product fetch failed:", e?.message || e);
    return null;
  }
}
