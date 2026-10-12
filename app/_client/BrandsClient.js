"use client";
import { useRouter } from "next/navigation";
import BrandsPage from "../../src/screens/BrandsPage.js";
import { pageToPath } from "../../src/lib/routes.js";
import { useStore } from "../../src/lib/StoreContext.js";

export default function BrandsClient() {
  const router = useRouter();
  const { products } = useStore();
  return (
    <BrandsPage
      products={products}
      setPage={(id) => router.push(pageToPath(id))}
      goToProducts={(sub) => router.push(pageToPath(sub))}
    />
  );
}
