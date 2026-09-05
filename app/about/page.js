"use client";

import { useRouter } from "next/navigation";
import AboutPage from "../../src/screens/AboutPage.js";
import { pageToPath } from "../../src/lib/routes.js";

export default function Page() {
  const router = useRouter();
  return (
    <AboutPage
      setPage={(id) => router.push(pageToPath(id))}
      goToProducts={(sub) => router.push(pageToPath(sub))}
    />
  );
}
