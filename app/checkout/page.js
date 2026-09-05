"use client";

import { useRouter } from "next/navigation";
import CheckoutPage from "../../src/screens/CheckoutPage.js";
import { useStore } from "../../src/lib/StoreContext.js";
import { pageToPath } from "../../src/lib/routes.js";

export default function Page() {
  const router = useRouter();
  const { cart, updateCartQty, removeFromCart, cartTotal, placeOrder } = useStore();

  return (
    <CheckoutPage
      setPage={(id) => router.push(pageToPath(id))}
      cart={cart}
      updateCartQty={updateCartQty}
      removeFromCart={removeFromCart}
      cartTotal={cartTotal}
      placeOrder={placeOrder}
    />
  );
}
