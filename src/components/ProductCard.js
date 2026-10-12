import Link from "next/link";

// One product card, used by the category pages and by search. Sold-out
// products are dimmed and marked, and low stock is called out.
export default function ProductCard({ p, pageTag, addToCart, toggleFavourite, isFav, openProduct }) {
  const soldOut = p.stock <= 0;
  const low = !soldOut && p.stock <= 5;
  return (
    <div
      className="skin-product-card"
      style={{ "--accent": p.accent }}
      data-soldout={soldOut ? "true" : undefined}
      onClick={() => openProduct({ ...p, _prevPage: pageTag })}
    >
      <div className="skin-img" style={{ background: p.bg }}>
        {p.images?.[0]
          ? <img src={p.images[0]} alt={p.name} loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "contain", position: "absolute", inset: 0 }} />
          : <span style={{ fontSize: "52px" }}>{p.emoji}</span>}
        {p.badge && !soldOut && <div className="skin-badge">{p.badge}</div>}
        {low && <div className="low-stock-tag">Only {p.stock} left</div>}
        <button className="product-wish-btn" aria-label={`Save ${p.name}`} onClick={e => { e.stopPropagation(); toggleFavourite({ ...p, _pageTag: pageTag }); }}>{isFav(p.id) ? "❤️" : "🤍"}</button>
      </div>
      <div className="skin-info">
        <div className="skin-brand">{p.brand}</div>
        <div className="skin-name">
          <Link href={`/product/${p.id}?from=${pageTag}`} className="plink" onClick={e => e.stopPropagation()}>{p.name}</Link>
        </div>
        <div className="skin-desc">{p.desc}</div>
        {p.reviews > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "10px" }}>
            <span style={{ color: "var(--skin-secondary)", fontSize: "12px" }}>{"★".repeat(Math.round(p.rating))}</span>
            <span style={{ fontSize: "11px", color: "rgba(28,15,20,0.4)" }}>({p.reviews.toLocaleString()})</span>
          </div>
        )}
        <div className="skin-footer">
          <div className="skin-price">{p.price}</div>
          <button className="add-btn-skin" disabled={soldOut} aria-label={soldOut ? `${p.name} is sold out` : `Add ${p.name} to cart`} onClick={e => { e.stopPropagation(); addToCart(p); }}>+</button>
        </div>
      </div>
    </div>
  );
}
