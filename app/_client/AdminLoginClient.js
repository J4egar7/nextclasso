"use client";
import { useRouter } from "next/navigation";
import AdminLoginPage from "../../src/screens/AdminLoginPage.js";
import { useStore } from "../../src/lib/StoreContext.js";
import { pageToPath } from "../../src/lib/routes.js";

export default function AdminLoginClient() {
  const router = useRouter();
  const { setUser } = useStore();
  return (
    <AdminLoginPage
      setPage={(id) => router.push(pageToPath(id))}
      setUser={setUser}
    />
  );
}
