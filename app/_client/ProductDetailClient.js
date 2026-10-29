"use client";

import { useRouter } from "next/navigation";
import { useParams, useSearchParams } from "next/navigation";
import ProductDetailPage from "../../src/screens/ProductDetailPage.js";
import { useStore } from "../../src/lib/StoreContext.js";
import { pageToPath } from "../../src/lib/routes.js";

export default function ProductDetailClient() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { addToCart, toggleFavourite, isFav, recentOrders, products, productsLoaded } = useStore();

  const product = products.find(p => String(p.id) === String(params.id));
  const prevPage = searchParams.get("from") || "home";

  // The catalog now loads from Supabase (no more instant hardcoded
  // fallback), so on first render `products` is briefly empty — show a
  // loading state instead of a false "not found" while that's in flight.
  if (!product && !productsLoaded) {
    return (
      <div style={{ padding: "120px 24px", textAlign: "center", color: "#999" }}>
        Loading…
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: "120px 24px", textAlign: "center" }}>
        <h2>Product not found</h2>
        <p>It may have been removed, or the link is incorrect.</p>
      </div>
    );
  }

  return (
    <ProductDetailPage
      product={product}
      setPage={(id) => router.push(pageToPath(id))}
      addToCart={addToCart}
      toggleFavourite={toggleFavourite}
      isFav={isFav}
      prevPage={product._prevPage || prevPage}
      recentOrders={recentOrders}
      products={products}
      openProduct={(p) => router.push(`/product/${p.id}?from=${p._prevPage || prevPage}`)}
    />
  );
}
