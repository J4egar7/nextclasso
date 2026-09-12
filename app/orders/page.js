"use client";

import { useRouter } from "next/navigation";
import OrdersPage from "../../src/screens/OrdersPage.js";
import { useStore } from "../../src/lib/StoreContext.js";
import { pageToPath } from "../../src/lib/routes.js";

export default function Page() {
  const router = useRouter();
  const { recentOrders } = useStore();

  return (
    <OrdersPage
      setPage={(id) => router.push(pageToPath(id))}
      recentOrders={recentOrders}
    />
  );
}
