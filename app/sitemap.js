import { supabase } from "../src/lib/supabase.js";

// The catalog now lives in Supabase and changes whenever an admin adds a
// product, so this needs to be generated fresh on each request rather
// than baked in at build time.
export const dynamic = "force-dynamic";

export default async function sitemap() {
  const base = "https://nextclasso.vercel.app";

  const staticRoutes = ["", "/about", "/brands", "/skincare", "/makeup", "/fragrances", "/hair-care", "/returns", "/contact", "/faq"].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.8,
  }));

  const { data: products, error } = await supabase
    .from("products")
    .select("id, updated_at");

  if (error) {
    console.error("sitemap: failed to load products:", error);
    return staticRoutes;
  }

  const productRoutes = (products || []).map((p) => ({
    url: `${base}/product/${p.id}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes];
}
