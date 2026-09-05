
function FavouritesDrawer({ favourites, toggleFavourite, addToCart, recentOrders, onClose }) {
  const getTheme = (item) => {
    const tag = item._pageTag || "";
    if (tag === "skincare") return "skin";
    if (tag === "makeup") return "makeup";
    return "home";
  };

  return (
    <>
      <div className="cart-overlay" onClick={onClose} />
      <div className="fav-drawer">
        <div className="fav-header">
          <div style={{ display:"flex", alignItems:"center" }}>
            <span className="fav-header-title">❤️ Favourites</span>
            {favourites.length > 0 && <span className="fav-header-count">{favourites.length}</span>}
          </div>
          <button className="fav-close" onClick={onClose}>✕</button>
        </div>

        {favourites.length === 0 ? (
          <div className="fav-empty">
            <div className="fav-empty-icon">🤍</div>
            <div className="fav-empty-text">No favourites yet</div>
            <div className="fav-empty-sub">Tap the heart on any product to save it here for later.</div>
          </div>
        ) : (
          <div className="fav-items">
            {favourites.map((item) => {
              const theme = getTheme(item);
              return (
                <div key={item.id} className={`fav-item ${theme}`}>
                  <div className="fav-item-emoji">{item.emoji || "🛍️"}</div>
                  <div className="fav-item-body">
                    <div className="fav-item-brand">{item.brand || "CLASO"}</div>
                    <div className="fav-item-name">{item.name}</div>
                    <div className="fav-item-price">{item.price}</div>
                  </div>
                  <div className="fav-item-actions">
                    <button className="fav-action-btn fav-add-btn" title="Add to bag" onClick={() => addToCart(item)}>🛍️</button>
                    <button className="fav-action-btn fav-remove-btn" title="Remove" onClick={() => toggleFavourite(item)}>✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* RECENTLY ORDERED */}
        <div className="recent-section">
          <div className="recent-label">🕐 Recently Ordered</div>
          {recentOrders.length === 0 ? (
            <div style={{ fontSize:"12px", color:"rgba(255,150,170,0.25)", textAlign:"center", padding:"16px 0" }}>No orders placed yet</div>
          ) : (
            recentOrders.slice(0, 8).map((item, i) => (
              <div key={i} className="recent-item">
                <div className="recent-emoji">{item.emoji || "🛍️"}</div>
                <div className="recent-name">{item.name}</div>
                <div className="recent-price">{item.price}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default FavouritesDrawer;
