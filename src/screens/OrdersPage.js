function OrdersPage({ setPage, recentOrders }) {
  // Defensive: older/malformed saved data (e.g. from before this feature
  // existed) shouldn't crash the page — just skip anything that doesn't
  // look like a real order.
  const orders = (recentOrders || []).filter(o => o && Array.isArray(o.items));

  const fmt = (n) => `PKR ${n.toLocaleString()}`;
  const fmtDate = (ts) => new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const fmtTime = (ts) => new Date(ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="page page-enter">
      <div className="co2-page" style={{ minHeight: "100vh" }}>
        <div className="co2-inner" style={{ maxWidth: "760px" }}>
          <button className="co2-back-btn" onClick={() => setPage("home")}>← Back to shop</button>
          <h1 className="co2-title">Your Orders</h1>
          <p className="co2-subtitle">
            {orders.length === 0
              ? "You haven't placed any orders yet."
              : `${orders.length} order${orders.length !== 1 ? "s" : ""} — saved on this device.`}
          </p>

          {orders.length === 0 ? (
            <div className="co2-card" style={{ textAlign: "center", padding: "50px 30px" }}>
              <div style={{ fontSize: "40px", marginBottom: "14px" }}>🛍️</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", marginBottom: "20px" }}>
                Once you place an order, it'll show up here so you can look back on it anytime.
              </div>
              <button className="co2-cta-btn" onClick={() => setPage("home")}>Start Shopping</button>
            </div>
          ) : (
            <div style={{ marginTop: "30px", display: "flex", flexDirection: "column", gap: "20px" }}>
              {orders.map(order => (
                <div key={order.id} className="co2-card" style={{ marginBottom: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", paddingBottom: "16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <div>
                      <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>
                        {order.id}
                      </div>
                      <div style={{ fontSize: "14px", color: "white", fontWeight: 600 }}>
                        {fmtDate(order.placedAt)} · {fmtTime(order.placedAt)}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginBottom: "4px" }}>Total</div>
                      <div style={{ fontSize: "20px", fontWeight: 700, color: "#FF8A5B", fontFamily: "var(--font-playfair), serif" }}>{fmt(order.total)}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {order.items.map((item, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: item.bg || "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>
                          {item.emoji || "🛍️"}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "13px", color: "white", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
                          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>{item.brand} · Qty {item.qty}</div>
                        </div>
                        <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", fontWeight: 600, flexShrink: 0 }}>{item.price}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "rgba(255,255,255,0.35)", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <span>Delivery</span>
                    <span>{order.deliveryFee === 0 ? "Free" : fmt(order.deliveryFee)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrdersPage;
