"use client";

import { useRouter } from "next/navigation";
import { useParams, useSearchParams } from "next/navigation";
import ProductDetailPage from "../../../src/screens/ProductDetailPage.js";
import { useStore } from "../../../src/lib/StoreContext.js";
import { pageToPath } from "../../../src/lib/routes.js";
import { bestsellerProducts } from "../../../src/data/products.js";

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { addToCart, toggleFavourite, isFav, recentOrders, adminProducts } = useStore();

  const allProducts = [...bestsellerProducts, ...adminProducts];
  const product = allProducts.find(p => String(p.id) === String(params.id));
  const prevPage = searchParams.get("from") || "home";

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
      openProduct={(p) => router.push(`/product/${p.id}?from=${p._prevPage || prevPage}`)}
    />
  );
}
