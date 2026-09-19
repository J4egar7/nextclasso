import ProductDetailClient from "../../_client/ProductDetailClient.js";
import { supabase } from "../../../src/lib/supabase.js";

export async function generateMetadata({ params }) {
  const { id } = await params;

  // Server-side read of the public columns only (same set as the
  // client-side storefront query, and the only columns anon can read —
  // see the column-privilege grant in supabase-schema.sql).
  const { data: product } = await supabase
    .from("products")
    .select("id, name, brand, description")
    .eq("id", id)
    .single();

  if (!product) {
    return {
      title: "Product",
      alternates: { canonical: `/product/${id}` },
    };
  }

  const title = `${product.name} — ${product.brand}`;
  const description = product.description
    ? `${product.description} Shop ${product.brand} ${product.name} on CLASO, delivered across Pakistan with cash on delivery.`
    : `Shop ${product.brand} ${product.name} on CLASO, delivered across Pakistan with cash on delivery.`;

  return {
    title,
    description,
    alternates: { canonical: `/product/${product.id}` },
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default function Page() {
  return <ProductDetailClient />;
}
