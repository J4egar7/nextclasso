import { useState, useRef } from "react";

function CheckoutMobile({ setPage, cart, updateCartQty, removeFromCart, cartTotal, logic }) {
  const {
    form, setField, errors, setErrors, step, setStep,
    otpCode, setOtpCode, otpError, setOtpError,
    sendingOtp, verifyingOtp,
    fmt, getTheme, validate, handleSendOtp, handleVerifyOtp,
    delivery, totalWithDelivery, itemCount, orderItemCount, orderTotal,
  } = logic;

  const [summaryOpen, setSummaryOpen] = useState(false);
  const otpRefs = useRef([]);

  // Mobile skips the separate "Review" screen entirely — everything lives
  // on one scrollable page, so tapping the sticky CTA validates and goes
  // straight to sending the OTP.
  const handleMobileSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      const firstErrorField = document.querySelector(".com-input.error, .com-textarea.error");
      if (firstErrorField) firstErrorField.scrollIntoView({ behavior: "instant", block: "center" });
      return;
    }
    if (cart.length === 0) { setErrors({ name: "Your cart is empty" }); return; }
    await handleSendOtp();
  };

  const handleOtpDigit = (idx, val) => {
    const digit = val.replace(/[^0-9]/g, "").slice(-1);
    const chars = otpCode.split("");
    chars[idx] = digit || "";
    const next = chars.join("").slice(0, 6);
    setOtpCode(next);
    setOtpError("");
    if (digit && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !otpCode[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
    if (e.key === "Enter") handleVerifyOtp();
  };

  // ── SUCCESS ──────────────────────────────────────────────────────────────────
  if (step === "success") return (
    <div className="com-page">
      <div className="com-success">
        <div className="com-success-ring"><div className="com-success-check">✓</div></div>
        <h1 className="com-success-title">Order Confirmed!</h1>
        <p className="com-success-msg">
          Thank you, <strong>{form.name}</strong>! Your order will arrive at{" "}
          <em>{form.address.split(",")[0]}</em>. We'll call <strong>{form.phone}</strong> to confirm.
        </p>
        <div className="com-success-pills">
          <span className="com-pill green">📦 {orderItemCount} item{orderItemCount !== 1 ? "s" : ""}</span>
          <span className="com-pill gold">{fmt(orderTotal)}</span>
          <span className="com-pill">🛵 Cash on Delivery</span>
        </div>
        <div className="com-success-actions">
          <button className="com-cta-btn" onClick={() => setPage("home")}>Continue Shopping →</button>
          <button className="com-secondary-btn" onClick={() => setPage("orders")}>View My Orders</button>
        </div>
      </div>
    </div>
  );

  // ── OTP STEP ─────────────────────────────────────────────────────────────────
  if (step === "otp") return (
    <div className="com-page">
      <div id="recaptcha-container" />
      <div className="com-otp-wrap">
        <button className="com-back-btn" onClick={() => setStep("details")}>← Back</button>
        <div className="com-otp-icon">📱</div>
        <h2 className="com-otp-title">Enter the code</h2>
        <p className="com-otp-hint">
          6-digit code sent to<br /><strong>{form.phone}</strong>
        </p>
        <div className="com-otp-boxes">
          {Array.from({ length: 6 }).map((_, i) => (
            <input
              key={i}
              ref={el => otpRefs.current[i] = el}
              className="com-otp-box"
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={otpCode[i] || ""}
              onChange={e => handleOtpDigit(i, e.target.value)}
              onKeyDown={e => handleOtpKeyDown(i, e)}
              autoFocus={i === 0}
            />
          ))}
        </div>
        {otpError && <div className="com-field-error" style={{ justifyContent: "center" }}>⚠ {otpError}</div>}
        <button className="com-cta-btn" onClick={handleVerifyOtp} disabled={verifyingOtp}>
          {verifyingOtp ? "Verifying…" : "Verify & Place Order"}
        </button>
        <div className="com-otp-resend">
          Didn't receive it?{" "}
          <span onClick={() => { setStep("details"); window.recaptchaVerifier = null; }}>Resend code</span>
        </div>
      </div>
    </div>
  );

  // ── SINGLE-PAGE FORM (details + review combined) ────────────────────────────
  return (
    <div className="com-page">
      <div id="recaptcha-container" />

      <div className="com-topbar">
        <button className="com-back-btn" onClick={() => setPage("home")}>← Shop</button>
        <div className="com-topbar-title">Checkout</div>
        <div className="com-topbar-count">{itemCount} item{itemCount !== 1 ? "s" : ""}</div>
      </div>

      <div className="com-inner">
        {/* COLLAPSIBLE ORDER SUMMARY */}
        <div className="com-card com-summary-card">
          <button className="com-summary-toggle" onClick={() => setSummaryOpen(o => !o)}>
            <span>🛍️ {itemCount} item{itemCount !== 1 ? "s" : ""} · {fmt(totalWithDelivery)}</span>
            <span className={`com-chevron ${summaryOpen ? "open" : ""}`}>⌄</span>
          </button>
          {summaryOpen && (
            <div className="com-summary-body">
              {cart.length === 0 ? (
                <div className="com-empty-cart">Your bag is empty</div>
              ) : cart.map(item => {
                const theme = getTheme(item);
                const unit  = parseInt((item.price || "").replace(/[^0-9]/g, "")) || 0;
                return (
                  <div key={item.id} className={`com-item ${theme}`}>
                    <div className="com-item-emoji">{item.emoji || "🛍️"}</div>
                    <div className="com-item-body">
                      <div className="com-item-name">{item.name}</div>
                      <div className="com-item-price">{fmt(unit * item.qty)}</div>
                    </div>
                    <div className="com-item-controls">
                      <button className="com-qty-btn" onClick={() => updateCartQty(item.id, -1)}>−</button>
                      <span className="com-qty-num">{item.qty}</span>
                      <button className="com-qty-btn" onClick={() => updateCartQty(item.id, 1)}>+</button>
                      <button className="com-remove-btn" onClick={() => removeFromCart(item.id)}>✕</button>
                    </div>
                  </div>
                );
              })}
              <div className="com-summary-row">
                <span>Delivery</span>
                <span className={delivery === 0 ? "com-free" : ""}>{delivery === 0 ? "FREE" : "PKR 250"}</span>
              </div>
              {cartTotal < 5000 && cartTotal > 0 && (
                <div className="com-free-hint">Add {fmt(5000 - cartTotal)} more for free delivery</div>
              )}
            </div>
          )}
        </div>

        {/* DETAILS FORM */}
        <div className="com-card">
          <div className="com-card-head">👤 Your Details</div>

          <div className="com-field">
            <label className="com-label">Full Name</label>
            <input
              className={`com-input ${errors.name ? "error" : ""}`}
              placeholder="e.g. Ayesha Khan"
              value={form.name}
              onChange={e => setField("name", e.target.value)}
            />
            {errors.name && <div className="com-field-error">⚠ {errors.name}</div>}
          </div>

          <div className="com-field">
            <label className="com-label">Email Address</label>
            <input
              className={`com-input ${errors.email ? "error" : ""}`}
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setField("email", e.target.value)}
            />
            {errors.email && <div className="com-field-error">⚠ {errors.email}</div>}
          </div>

          <div className="com-field">
            <label className="com-label">Phone Number</label>
            <div className="com-phone-wrap">
              <span className="com-phone-prefix">🇵🇰 +92</span>
              <input
                className={`com-input com-phone-input ${errors.phone ? "error" : ""}`}
                type="tel"
                inputMode="numeric"
                placeholder="03XXXXXXXXX"
                value={form.phone}
                onChange={e => setField("phone", e.target.value)}
              />
            </div>
            {errors.phone && <div className="com-field-error">⚠ {errors.phone}</div>}
            <div className="com-hint">Verification code sent here</div>
          </div>

          <div className="com-field">
            <label className="com-label">Delivery Address</label>
            <textarea
              className={`com-textarea ${errors.address ? "error" : ""}`}
              placeholder="House/flat no., street, area, city…"
              value={form.address}
              onChange={e => setField("address", e.target.value)}
            />
            {errors.address && <div className="com-field-error">⚠ {errors.address}</div>}
          </div>
        </div>

        {/* PAYMENT — static confirmation, COD is the only option */}
        <div className="com-cod-chip">
          <span style={{ fontSize: "22px" }}>💵</span>
          <div className="com-cod-text">
            <div className="com-cod-title">Cash on Delivery</div>
            <div className="com-cod-sub">Pay when your order arrives</div>
          </div>
          <span className="com-cod-check">✓</span>
        </div>

        {/* Bottom padding so the sticky bar never covers content */}
        <div style={{ height: "12px" }} />
      </div>

      {/* STICKY BOTTOM BAR — total + CTA always visible, no scrolling to find it */}
      <div className="com-sticky-bar">
        <div className="com-sticky-total">
          <div className="com-sticky-total-label">Total</div>
          <div className="com-sticky-total-val">{fmt(totalWithDelivery)}</div>
        </div>
        <button className="com-cta-btn com-sticky-cta" disabled={sendingOtp || cart.length === 0} onClick={handleMobileSubmit}>
          {sendingOtp ? "Sending code…" : "Place Order"}
        </button>
      </div>
    </div>
  );
}

export default CheckoutMobile;
