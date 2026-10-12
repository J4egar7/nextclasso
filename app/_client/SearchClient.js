"use client";
import { useRouter } from "next/navigation";
import SearchPage from "../../src/screens/SearchPage.js";
import { useStore } from "../../src/lib/StoreContext.js";

export default function SearchClient() {
  const router = useRouter();
  const { addToCart, toggleFavourite, isFav, products, productsLoaded } = useStore();
  return (
    <SearchPage
      products={products}
      productsLoaded={productsLoaded}
      addToCart={(p) => addToCart(p, "search")}
      toggleFavourite={toggleFavourite}
      isFav={isFav}
      openProduct={(p) => router.push(`/product/${p.id}?from=search`)}
    />
  );
}
