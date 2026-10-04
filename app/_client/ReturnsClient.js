"use client";
import { useRouter } from "next/navigation";
import ReturnsPage from "../../src/screens/ReturnsPage.js";
import { pageToPath } from "../../src/lib/routes.js";

export default function ReturnsClient() {
  const router = useRouter();
  return <ReturnsPage setPage={(id) => router.push(pageToPath(id))} />;
}
