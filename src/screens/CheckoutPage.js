import { useState, useEffect } from "react";
import useCheckoutLogic from "./checkout/useCheckoutLogic.js";
import CheckoutDesktop from "./checkout/CheckoutDesktop.js";
import CheckoutMobile from "./checkout/CheckoutMobile.js";

// Desktop and mobile checkout are two genuinely separate UIs now (not a
// CSS-hidden duplicate) — but they share ONE instance of the checkout
// logic (useCheckoutLogic), so there's only ever one Firebase OTP flow,
// one cart snapshot, one #recaptcha-container in the DOM at a time.
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
