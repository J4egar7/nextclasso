"use client";
import { useRouter } from "next/navigation";
import AdminPage from "../../src/screens/AdminPage.js";
import { useStore } from "../../src/lib/StoreContext.js";
import { pageToPath } from "../../src/lib/routes.js";

export default function AdminClient() {
  const router = useRouter();
  const { user, setUser, authChecked } = useStore();
  return (
    <AdminPage
      setPage={(id) => router.push(pageToPath(id))}
      user={user}
      setUser={setUser}
      authChecked={authChecked}
    />
  );
}
