"use client";
import { useRouter } from "next/navigation";
import FaqPage from "../../src/screens/FaqPage.js";
import { pageToPath } from "../../src/lib/routes.js";

export default function FaqClient() {
  const router = useRouter();
  return <FaqPage setPage={(id) => router.push(pageToPath(id))} />;
}
