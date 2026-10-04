"use client";
import { useRouter } from "next/navigation";
import CategoryBrowsePage from "../../src/screens/CategoryBrowsePage.js";
import { useStore } from "../../src/lib/StoreContext.js";
import { pageToPath } from "../../src/lib/routes.js";

export default function CategoryClient({ pageTag, eyebrow, title, titleEm, blurb, categories }) {
  const router = useRouter();
  const { addToCart, toggleFavourite, isFav, products, productsLoaded } = useStore();
  return (
    <CategoryBrowsePage
      pageTag={pageTag}
      eyebrow={eyebrow}
      title={title}
      titleEm={titleEm}
      blurb={blurb}
      categories={categories}
      products={products}
      productsLoaded={productsLoaded}
      addToCart={(p) => addToCart(p, pageTag)}
      toggleFavourite={toggleFavourite}
      isFav={isFav}
      openProduct={(p) => router.push(`/product/${p.id}?from=${pageTag}`)}
      setPage={(id) => router.push(pageToPath(id))}
    />
  );
}
