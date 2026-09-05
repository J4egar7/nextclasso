"use client";

import { useRouter } from "next/navigation";
import BrandsPage from "../../src/screens/BrandsPage.js";
import { pageToPath } from "../../src/lib/routes.js";

export default function Page() {
  const router = useRouter();
  return (
    <BrandsPage
      setPage={(id) => router.push(pageToPath(id))}
      goToProducts={(sub) => router.push(pageToPath(sub))}
    />
  );
}
