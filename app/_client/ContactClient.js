"use client";
import { useRouter } from "next/navigation";
import ContactPage from "../../src/screens/ContactPage.js";
import { pageToPath } from "../../src/lib/routes.js";

export default function ContactClient() {
  const router = useRouter();
  return <ContactPage setPage={(id) => router.push(pageToPath(id))} />;
}
