"use client";

import { useRouter } from "next/navigation";
import MakeupPage from "../../src/screens/MakeupPage.js";
import { useStore } from "../../src/lib/StoreContext.js";
import { pageToPath } from "../../src/lib/routes.js";

export default function Page() {
  const router = useRouter();
  const { addToCart, toggleFavourite, isFav, adminProducts } = useStore();

  return (
    <MakeupPage
      setPage={(id) => router.push(pageToPath(id))}
      goToProducts={(sub) => router.push(pageToPath(sub))}
      addToCart={(p) => addToCart(p, "makeup")}
      toggleFavourite={toggleFavourite}
      isFav={isFav}
      openProduct={(p) => router.push(`/product/${p.id}?from=makeup`)}
      adminProducts={adminProducts}
    />
  );
}
