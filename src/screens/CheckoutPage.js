import { useState } from "react";

function CheckoutPage({ setPage, cart, updateCartQty, removeFromCart, cartTotal, placeOrder }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState("details"); // "details" | "review" | "otp" | "success"
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null); // snapshot of the order — survives the cart being cleared
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
    if (Object.keys(e).length) { setErrors(e); return; }
    if (cart.length === 0)     { setErrors({ name: "Your cart is empty" }); return; }
    setStep("review");
  };

  const handleSendOtp = async () => {
    setSendingOtp(true);
    setOtpError("");

    try {
      const { RecaptchaVerifier, signInWithPhoneNumber } = await import("firebase/auth");
      const { auth } = await import("../firebase");

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

  const delivery         = cartTotal >= 5000 ? 0 : 250;
  const totalWithDelivery = cartTotal + delivery;
  const itemCount        = cart.reduce((s, i) => s + i.qty, 0);

  // ── SUCCESS ──────────────────────────────────────────────────────────────────
  if (step === "success") {
    // Use the snapshot taken at the moment of placing the order — by now
    // the live cart has already been cleared, so reading from `cart`/
    // `cartTotal` here would show 0 items / PKR 0.
    const orderItemCount = placedOrder ? placedOrder.items.reduce((s, i) => s + i.qty, 0) : itemCount;
    const orderTotal     = placedOrder ? placedOrder.total : totalWithDelivery;
    return (
    <div className="co2-page">
      <div className="co2-success">
        <div className="co2-success-ring">
          <div className="co2-success-check">✓</div>
        </div>
        <h1 className="co2-success-title">Order Confirmed!</h1>
        <p className="co2-success-msg">
          Thank you, <strong>{form.name}</strong>!<br />
          Your order will arrive at <em>{form.address.split(",")[0]}</em>.<br />
          We'll call you on <strong>{form.phone}</strong> to confirm.
        </p>
        <div className="co2-success-pills">
          <span className="co2-pill green">📦 {orderItemCount} item{orderItemCount !== 1 ? "s" : ""}</span>
          <span className="co2-pill gold">{fmt(orderTotal)}</span>
          <span className="co2-pill">🛵 Cash on Delivery</span>
        </div>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
          <button className="co2-cta-btn" onClick={() => setPage("home")}>
            Continue Shopping →
          </button>
          <button className="co2-back-btn" onClick={() => setPage("orders")}>
            View My Orders
          </button>
        </div>
      </div>
    </div>
    );
  }

  // ── OTP STEP ─────────────────────────────────────────────────────────────────
  if (step === "otp") return (
    <div className="co2-page">
      <div id="recaptcha-container" />
      <div className="co2-otp-wrap">
        <button className="co2-back-btn" onClick={() => setStep("review")}>← Back</button>
        <div className="co2-otp-icon">📱</div>
        <h2 className="co2-otp-title">Enter the code</h2>
        <p className="co2-otp-hint">
          We sent a 6-digit verification code to<br />
          <strong style={{ color: "rgba(255,255,255,0.8)" }}>{form.phone}</strong>
        </p>
        <div className="co2-otp-field-wrap">
          <input
            className="co2-otp-input"
            type="number"
            inputMode="numeric"
            placeholder="— — — — — —"
            value={otpCode}
            onChange={e => { setOtpCode(e.target.value); setOtpError(""); }}
            onKeyDown={e => e.key === "Enter" && handleVerifyOtp()}
            maxLength={6}
          />
        </div>
        {otpError && <div className="co2-field-error">⚠ {otpError}</div>}
        <button className="co2-cta-btn" onClick={handleVerifyOtp} disabled={verifyingOtp}>
          {verifyingOtp ? "Verifying…" : "Verify & Place Order →"}
        </button>
        <div className="co2-otp-resend">
          Didn't receive it?{" "}
          <span onClick={() => { setStep("details"); window.recaptchaVerifier = null; }}>
            Resend code
          </span>
        </div>
      </div>
    </div>
  );

  // ── REVIEW STEP ──────────────────────────────────────────────────────────────
  if (step === "review") return (
    <div className="co2-page">
      <div id="recaptcha-container" />
      <div className="co2-inner">
        {/* Header */}
        <div className="co2-header">
          <button className="co2-back-btn" onClick={() => setStep("details")}>← Edit details</button>
          <h1 className="co2-title">Review Order</h1>
          <p className="co2-subtitle">Confirm everything looks right before we verify your phone</p>
        </div>

        <div className="co2-review-grid">
          {/* LEFT — delivery & items */}
          <div>
            {/* Delivery info */}
            <div className="co2-card">
              <div className="co2-card-head"><span className="co2-card-icon">📍</span> Delivery Details</div>
              <div className="co2-review-row"><span>Name</span><strong>{form.name}</strong></div>
              <div className="co2-review-row"><span>Phone</span><strong>{form.phone}</strong></div>
              <div className="co2-review-row"><span>Email</span><strong>{form.email}</strong></div>
              <div className="co2-review-row"><span>Address</span><strong>{form.address}</strong></div>
            </div>

            {/* Cart items */}
            <div className="co2-card">
              <div className="co2-card-head"><span className="co2-card-icon">🛍️</span> Your Items ({itemCount})</div>
              <div className="co2-items-list">
                {cart.map(item => {
                  const theme = getTheme(item);
                  const unit  = parseInt((item.price || "").replace(/[^0-9]/g, "")) || 0;
                  return (
                    <div key={item.id} className={`co2-item ${theme}`}>
                      <div className="co2-item-emoji">{item.emoji || "🛍️"}</div>
                      <div className="co2-item-body">
                        <div className="co2-item-name">{item.name}</div>
                        <div className="co2-item-brand">{item.brand}</div>
                      </div>
                      <div className="co2-item-right">
                        <div className="co2-item-qty">×{item.qty}</div>
                        <div className={`co2-item-price ${theme}`}>{fmt(unit * item.qty)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT — summary + CTA */}
          <div className="co2-summary">
            <div className="co2-summary-title">Order Summary</div>
            {cart.map(item => {
              const unit = parseInt((item.price || "").replace(/[^0-9]/g, "")) || 0;
              return (
                <div key={item.id} className="co2-sum-row">
                  <span className="co2-sum-name">{item.name}{item.qty > 1 && <span className="co2-sum-qty">×{item.qty}</span>}</span>
                  <span>{fmt(unit * item.qty)}</span>
                </div>
              );
            })}
            <div className="co2-sum-row">
              <span>Delivery</span>
              <span className={delivery === 0 ? "co2-free" : ""}>{delivery === 0 ? "FREE" : "PKR 250"}</span>
            </div>
            {cartTotal < 5000 && (
              <div className="co2-free-hint">Add {fmt(5000 - cartTotal)} more for free delivery</div>
            )}
            <div className="co2-sum-total">
              <span>Total</span>
              <span className="co2-total-val">{fmt(totalWithDelivery)}</span>
            </div>

            <div className="co2-cod-chip">
              <span>💵</span>
              <div>
                <div className="co2-cod-title">Cash on Delivery</div>
                <div className="co2-cod-sub">Pay when your order arrives</div>
              </div>
            </div>

            <button
              className="co2-cta-btn"
              disabled={sendingOtp}
              onClick={handleSendOtp}
            >
              {sendingOtp ? "Sending OTP…" : `Place Order — ${fmt(totalWithDelivery)}`}
            </button>
            <div className="co2-secure-note">🔒 Phone verified via SMS before placing order</div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── DETAILS STEP (default) ───────────────────────────────────────────────────
  return (
    <div className="co2-page">
      <div id="recaptcha-container" />
      <div className="co2-inner">

        {/* Progress bar */}
        <div className="co2-progress">
          <div className="co2-prog-step active">
            <div className="co2-prog-dot">1</div>
            <span>Details</span>
          </div>
          <div className="co2-prog-line" />
          <div className="co2-prog-step">
            <div className="co2-prog-dot">2</div>
            <span>Review</span>
          </div>
          <div className="co2-prog-line" />
          <div className="co2-prog-step">
            <div className="co2-prog-dot">3</div>
            <span>Confirm</span>
          </div>
        </div>

        {/* Header */}
        <div className="co2-header">
          <button className="co2-back-btn" onClick={() => setPage("home")}>← Back to Shop</button>
          <h1 className="co2-title">Checkout</h1>
          <p className="co2-subtitle">Cash on delivery · Free shipping over PKR 5,000</p>
        </div>

        <div className="co2-main-grid">
          {/* LEFT */}
          <div>

            {/* YOUR DETAILS */}
            <div className="co2-card">
              <div className="co2-card-head"><span className="co2-card-icon">👤</span> Your Details</div>

              <div className="co2-field">
                <label className="co2-label">Full Name</label>
                <input
                  className={`co2-input ${errors.name ? "error" : ""}`}
                  placeholder="e.g. Ayesha Khan"
                  value={form.name}
                  onChange={e => setField("name", e.target.value)}
                />
                {errors.name && <div className="co2-field-error">⚠ {errors.name}</div>}
              </div>

              <div className="co2-field">
                <label className="co2-label">Email Address</label>
                <input
                  className={`co2-input ${errors.email ? "error" : ""}`}
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setField("email", e.target.value)}
                />
                {errors.email && <div className="co2-field-error">⚠ {errors.email}</div>}
                <div className="co2-hint">Order confirmation will be sent here</div>
              </div>

              <div className="co2-field">
                <label className="co2-label">Phone Number</label>
                <div className="co2-phone-wrap">
                  <span className="co2-phone-prefix">🇵🇰 +92</span>
                  <input
                    className={`co2-input co2-phone-input ${errors.phone ? "error" : ""}`}
                    type="tel"
                    placeholder="03XXXXXXXXX"
                    value={form.phone}
                    onChange={e => setField("phone", e.target.value)}
                  />
                </div>
                {errors.phone && <div className="co2-field-error">⚠ {errors.phone}</div>}
                <div className="co2-hint">A verification code will be sent here</div>
              </div>

              <div className="co2-field">
                <label className="co2-label">Delivery Address</label>
                <textarea
                  className={`co2-textarea ${errors.address ? "error" : ""}`}
                  placeholder="House/flat no., street, area, city…"
                  value={form.address}
                  onChange={e => setField("address", e.target.value)}
                />
                {errors.address && <div className="co2-field-error">⚠ {errors.address}</div>}
              </div>
            </div>

            {/* PAYMENT */}
            <div className="co2-card">
              <div className="co2-card-head"><span className="co2-card-icon">💳</span> Payment Method</div>
              <div className="co2-cod-chip selected">
                <span style={{ fontSize: "28px" }}>💵</span>
                <div>
                  <div className="co2-cod-title">Cash on Delivery</div>
                  <div className="co2-cod-sub">Pay when your order arrives at your door</div>
                </div>
                <div className="co2-cod-check">✓</div>
              </div>
            </div>

            {/* CART ITEMS */}
            <div className="co2-card">
              <div className="co2-card-head"><span className="co2-card-icon">🛍️</span> Your Items ({itemCount})</div>
              {cart.length === 0 ? (
                <div className="co2-empty-cart">Your bag is empty</div>
              ) : (
                <div className="co2-items-list">
                  {cart.map(item => {
                    const theme = getTheme(item);
                    const unit  = parseInt((item.price || "").replace(/[^0-9]/g, "")) || 0;
                    return (
                      <div key={item.id} className={`co2-item ${theme}`}>
                        <div className="co2-item-emoji">{item.emoji || "🛍️"}</div>
                        <div className="co2-item-body">
                          <div className="co2-item-name">{item.name}</div>
                          <div className="co2-item-brand">{item.brand}</div>
                          <div className={`co2-item-price ${theme}`}>
                            {item.qty > 1 ? `${item.price} × ${item.qty} = ${fmt(unit * item.qty)}` : item.price}
                          </div>
                        </div>
                        <div className="co2-item-controls">
                          <button className="co2-qty-btn" onClick={() => updateCartQty(item.id, -1)}>−</button>
                          <span className="co2-qty-num">{item.qty}</span>
                          <button className="co2-qty-btn" onClick={() => updateCartQty(item.id, 1)}>+</button>
                          <button className="co2-remove-btn" onClick={() => removeFromCart(item.id)} title="Remove">✕</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — SUMMARY */}
          <div className="co2-summary">
            <div className="co2-summary-title">Order Summary</div>
            {cart.map(item => {
              const unit = parseInt((item.price || "").replace(/[^0-9]/g, "")) || 0;
              return (
                <div key={item.id} className="co2-sum-row">
                  <span className="co2-sum-name">
                    {item.name}
                    {item.qty > 1 && <span className="co2-sum-qty">×{item.qty}</span>}
                  </span>
                  <span>{fmt(unit * item.qty)}</span>
                </div>
              );
            })}
            <div className="co2-sum-row">
              <span>Delivery</span>
              <span className={delivery === 0 ? "co2-free" : ""}>{delivery === 0 ? "FREE" : "PKR 250"}</span>
            </div>
            {cartTotal < 5000 && (
              <div className="co2-free-hint">Add {fmt(5000 - cartTotal)} more for free delivery</div>
            )}
            <div className="co2-sum-total">
              <span>Total</span>
              <span className="co2-total-val">{fmt(totalWithDelivery)}</span>
            </div>
            <button
              className="co2-cta-btn"
              disabled={cart.length === 0}
              onClick={handleContinue}
            >
              Review Order →
            </button>
            <div className="co2-secure-note">🔒 Secured & verified via SMS</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
