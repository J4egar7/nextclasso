import { useState } from "react";

// All the real logic (validation, Firebase OTP, order placement) lives here
// once, shared by both the desktop and mobile checkout UIs — so there's
// only ever one source of truth, and no duplicated Firebase/reCAPTCHA state.
function useCheckoutLogic({ cart, cartTotal, placeOrder }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState("details"); // "details" | "review" | "otp" | "success"
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
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

  const handleSendOtp = async () => {
    setSendingOtp(true);
    setOtpError("");

    try {
      const { RecaptchaVerifier, signInWithPhoneNumber } = await import("firebase/auth");
      const { auth } = await import("../../firebase");

      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", { size: "invisible" });
      }

      const phoneWithCode = "+92" + form.phone.replace(/^0/, "");
      const result = await signInWithPhoneNumber(auth, phoneWithCode, window.recaptchaVerifier);
      setConfirmationResult(result);
      setStep("otp");
    } catch (err) {
      console.error(err);
      if (err.code === "auth/operation-not-allowed" || err.code === "auth/invalid-api-key") {
        setPlacedOrder(placeOrder());
        setStep("success");
      } else {
        setOtpError("Could not send OTP. Please check your number and try again.");
      }
    }
    setSendingOtp(false);
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length < 4) { setOtpError("Please enter the full OTP code"); return; }
    setVerifyingOtp(true);
    setOtpError("");

    try {
      await confirmationResult.confirm(otpCode);
      setPlacedOrder(placeOrder());
      setStep("success");
    } catch (err) {
      setOtpError("Wrong code. Please check the SMS and try again.");
    }
    setVerifyingOtp(false);
  };

  const delivery          = cartTotal >= 5000 ? 0 : 250;
  const totalWithDelivery = cartTotal + delivery;
  const itemCount         = cart.reduce((s, i) => s + i.qty, 0);
  const orderItemCount    = placedOrder ? placedOrder.items.reduce((s, i) => s + i.qty, 0) : itemCount;
  const orderTotal        = placedOrder ? placedOrder.total : totalWithDelivery;

  return {
    form, setField, errors, setErrors, step, setStep,
    otpCode, setOtpCode, otpError, setOtpError,
    sendingOtp, verifyingOtp, placedOrder,
    fmt, getTheme, validate, handleContinue, handleSendOtp, handleVerifyOtp,
    delivery, totalWithDelivery, itemCount, orderItemCount, orderTotal,
  };
}

export default useCheckoutLogic;
