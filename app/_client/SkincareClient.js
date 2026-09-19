"use client";
import { useRouter } from "next/navigation";
import SkincarePage from "../../src/screens/SkincarePage.js";
import { useStore } from "../../src/lib/StoreContext.js";
import { pageToPath } from "../../src/lib/routes.js";

export default function SkincareClient() {
  const router = useRouter();
  const { addToCart, toggleFavourite, isFav, products } = useStore();
  return (
    <SkincarePage
      setPage={(id) => router.push(pageToPath(id))}
      goToProducts={(sub) => router.push(pageToPath(sub))}
      addToCart={(p) => addToCart(p, "skincare")}
      toggleFavourite={toggleFavourite}
      isFav={isFav}
      openProduct={(p) => router.push(`/product/${p.id}?from=skincare`)}
      products={products}
    />
  );
}
