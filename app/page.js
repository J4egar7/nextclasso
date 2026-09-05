"use client";

import { useRouter } from "next/navigation";
import HomePage from "../src/screens/HomePage.js";
import { useStore } from "../src/lib/StoreContext.js";
import { pageToPath } from "../src/lib/routes.js";

export default function Page() {
  const router = useRouter();
  const { addToCart, toggleFavourite, isFav, adminProducts } = useStore();

  return (
    <HomePage
      setPage={(id) => router.push(pageToPath(id))}
      goToProducts={(sub) => router.push(pageToPath(sub))}
      addToCart={(p) => addToCart(p, "home")}
      toggleFavourite={toggleFavourite}
      isFav={isFav}
      openProduct={(p) => router.push(`/product/${p.id}?from=home`)}
      adminProducts={adminProducts}
    />
  );
}
