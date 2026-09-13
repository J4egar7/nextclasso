import { useState } from "react";

// All the real logic (validation, order placement) lives here once,
// shared by both the desktop and mobile checkout UIs.
function useCheckoutLogic({ cart, cartTotal, placeOrder }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState("details"); // "details" | "review" | "success"
  const [placingOrder, setPlacingOrder] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  const fmt = (n) => "PKR " + n.toLocaleString("en-PK");

  const getTheme = (item) => {
    const tag = item._pageTag || "";
    if (tag === "skincare") return "skin";
    if (tag === "makeup")   return "makeup";
    return "home";
  };

  const setField = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())                                              e.name    = "Full name is required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email   = "Enter a valid email address";
    if (!/^03\d{9}$/.test(form.phone.replace(/\s/g, "")))              e.phone   = "Enter a valid Pakistani number (e.g. 03001234567)";
    if (form.address.trim().length < 10)                               e.address = "Please enter a complete delivery address";
    return e;
  };

  const handleContinue = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return false; }
    if (cart.length === 0)     { setErrors({ name: "Your cart is empty" }); return false; }
    setStep("review");
    return true;
  };

  // Places the order directly — no phone/OTP verification anymore.
  // Orders are confirmed manually (a message to the customer) instead.
  const confirmOrder = async () => {
    setPlacingOrder(true);
    const order = await placeOrder({ name: form.name, email: form.email, phone: form.phone, address: form.address });
    setPlacedOrder(order);
    setStep("success");
    setPlacingOrder(false);
  };

  const delivery          = cartTotal >= 5000 ? 0 : 250;
  const totalWithDelivery = cartTotal + delivery;
  const itemCount         = cart.reduce((s, i) => s + i.qty, 0);
  const orderItemCount    = placedOrder ? placedOrder.items.reduce((s, i) => s + i.qty, 0) : itemCount;
  const orderTotal        = placedOrder ? placedOrder.total : totalWithDelivery;

  return {
    form, setField, errors, setErrors, step, setStep,
    placingOrder, placedOrder,
    fmt, getTheme, validate, handleContinue, confirmOrder,
    delivery, totalWithDelivery, itemCount, orderItemCount, orderTotal,
  };
}

export default useCheckoutLogic;
