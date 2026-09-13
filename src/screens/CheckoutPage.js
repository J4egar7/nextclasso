import { useState, useEffect } from "react";
import useCheckoutLogic from "./checkout/useCheckoutLogic.js";
import CheckoutDesktop from "./checkout/CheckoutDesktop.js";
import CheckoutMobile from "./checkout/CheckoutMobile.js";

// Desktop and mobile checkout are two genuinely separate UIs, sharing
// one instance of the checkout logic (useCheckoutLogic) so there's a
// single source of truth for cart/order state regardless of which
// UI is showing.
function CheckoutPage({ setPage, cart, updateCartQty, removeFromCart, cartTotal, placeOrder }) {
  const logic = useCheckoutLogic({ cart, cartTotal, placeOrder });
  const [isMobile, setIsMobile] = useState(null); // null until we know, to avoid a flash of the wrong UI

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    setIsMobile(mq.matches);
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  if (isMobile === null) return null; // brief, avoids rendering the wrong version pre-hydration

  const sharedProps = { setPage, cart, updateCartQty, removeFromCart, cartTotal, logic };

  return isMobile
    ? <CheckoutMobile {...sharedProps} />
    : <CheckoutDesktop {...sharedProps} />;
}

export default CheckoutPage;
