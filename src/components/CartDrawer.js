
function CartDrawer({ cart, removeFromCart, updateCartQty, cartTotal, onClose, onCheckout }) {
  const getTheme = (item) => {
    const tag = item._pageTag || "";
    if (tag === "skincare") return "skin";
    if (tag === "makeup") return "makeup";
    return "home";
  };
  const fmt = (n) => "PKR " + n.toLocaleString("en-PK");
  const totalItems = cart.reduce((s,i) => s + i.qty, 0);

  return (
    <>
      <div className="cart-overlay" onClick={onClose} />
      <div className="cart-drawer">
        <div className="cart-header">
          <div style={{ display:"flex", alignItems:"center" }}>
            <span className="cart-header-title">Your Bag</span>
            {totalItems > 0 && <span className="cart-header-count">{totalItems} item{totalItems !== 1 ? "s" : ""}</span>}
          </div>
          <button className="cart-close" onClick={onClose}>✕</button>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🛍️</div>
            <div className="cart-empty-text">Your bag is empty</div>
            <div className="cart-empty-sub">Add something beautiful and it'll appear here.</div>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => {
                const theme = getTheme(item);
                const unitPrice = parseInt((item.price||"").replace(/[^0-9]/g,""))||0;
                return (
                  <div key={item.id} className={`cart-item ${theme}`}>
                    <div className="cart-item-emoji">{item.emoji || "🛍️"}</div>
                    <div className="cart-item-body">
                      <div className="cart-item-brand">{item.brand || "CLASO"}</div>
                      <div className="cart-item-name">{item.name}</div>
                      <div className="cart-item-price">{item.price}</div>
                      <div className="cart-qty-row">
                        <button className="cart-qty-btn" onClick={() => updateCartQty(item.id, -1)}>−</button>
                        <span className="cart-qty-num">{item.qty}</span>
                        <button className="cart-qty-btn" onClick={() => updateCartQty(item.id, 1)}>+</button>
                        {item.qty > 1 && <span style={{fontSize:"11px",color:"rgba(255,255,255,0.3)",marginLeft:"4px"}}>= {fmt(unitPrice * item.qty)}</span>}
                      </div>
                    </div>
                    <button className="cart-item-remove" onClick={() => removeFromCart(item.id)} title="Remove">✕</button>
                  </div>
                );
              })}
            </div>
            <div className="cart-footer">
              <div className="cart-total-row">
                <span className="cart-total-label">Total</span>
                <span className="cart-total-val">{fmt(cartTotal)}</span>
              </div>
              <button className="cart-checkout-btn" onClick={onCheckout}>Proceed to Checkout →</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default CartDrawer;
