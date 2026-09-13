function CheckoutDesktop({ setPage, cart, updateCartQty, removeFromCart, cartTotal, logic }) {
  const {
    form, setField, errors, step, setStep,
    placingOrder,
    fmt, getTheme, handleContinue, confirmOrder,
    delivery, totalWithDelivery, itemCount, orderItemCount, orderTotal,
  } = logic;

  // ── SUCCESS ──────────────────────────────────────────────────────────────────
  if (step === "success") return (
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

  // ── REVIEW STEP ──────────────────────────────────────────────────────────────
  if (step === "review") return (
    <div className="co2-page">
      <div className="co2-inner">
        <div className="co2-header">
          <button className="co2-back-btn" onClick={() => setStep("details")}>← Edit details</button>
          <h1 className="co2-title">Review Order</h1>
          <p className="co2-subtitle">Confirm everything looks right before we verify your phone</p>
        </div>

        <div className="co2-review-grid">
          <div>
            <div className="co2-card">
              <div className="co2-card-head"><span className="co2-card-icon">📍</span> Delivery Details</div>
              <div className="co2-review-row"><span>Name</span><strong>{form.name}</strong></div>
              <div className="co2-review-row"><span>Phone</span><strong>{form.phone}</strong></div>
              <div className="co2-review-row"><span>Email</span><strong>{form.email}</strong></div>
              <div className="co2-review-row"><span>Address</span><strong>{form.address}</strong></div>
            </div>

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

            <button className="co2-cta-btn" disabled={placingOrder} onClick={confirmOrder}>
              {placingOrder ? "Placing Order…" : `Place Order — ${fmt(totalWithDelivery)}`}
            </button>
            <div className="co2-secure-note">📞 We'll message you directly to confirm this order</div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── DETAILS STEP (default) ───────────────────────────────────────────────────
  return (
    <div className="co2-page">
      <div className="co2-inner">

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

        <div className="co2-header">
          <button className="co2-back-btn" onClick={() => setPage("home")}>← Back to Shop</button>
          <h1 className="co2-title">Checkout</h1>
          <p className="co2-subtitle">Cash on delivery · Free shipping over PKR 5,000</p>
        </div>

        <div className="co2-main-grid">
          <div>
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
            <button className="co2-cta-btn" disabled={cart.length === 0} onClick={handleContinue}>
              Review Order →
            </button>
            <div className="co2-secure-note">📞 We'll message you to confirm your order</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutDesktop;
