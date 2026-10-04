function CategoryBrowsePage({
  eyebrow, title, titleEm, blurb, categories, pageTag,
  products, productsLoaded, addToCart, toggleFavourite, isFav, openProduct, setPage,
}) {
  const items = (products || []).filter(p => categories.includes(p.category));

  const ProductCard = ({ p }) => (
    <div className="skin-product-card" onClick={() => openProduct({ ...p, _prevPage: pageTag })}>
      <div className="skin-img" style={{ background: p.bg }}>
        {p.images?.[0]
          ? <img src={p.images[0]} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
          : <span style={{ fontSize: "52px" }}>{p.emoji}</span>}
        {p.badge && <div className="skin-badge">{p.badge}</div>}
        <button className="product-wish-btn" onClick={e => { e.stopPropagation(); toggleFavourite({ ...p, _pageTag: pageTag }); }}>{isFav(p.id) ? "❤️" : "🤍"}</button>
      </div>
      <div className="skin-info">
        <div className="skin-brand">{p.brand}</div>
        <div className="skin-name">{p.name}</div>
        <div className="skin-desc">{p.desc}</div>
        {p.reviews > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "10px" }}>
            <span style={{ color: "var(--skin-secondary)", fontSize: "12px" }}>{"★".repeat(Math.floor(p.rating))}</span>
            <span style={{ fontSize: "11px", color: "rgba(28,15,20,0.4)" }}>({p.reviews.toLocaleString()})</span>
          </div>
        )}
        <div className="skin-footer">
          <div className="skin-price">{p.price}</div>
          <button className="add-btn-skin" onClick={e => { e.stopPropagation(); addToCart(p); }}>+</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page page-enter">
      <section className="skin-section category-browse">
        <div className="skin-section-header">
          <div className="skin-eyebrow">{eyebrow}</div>
          <h1 className="skin-section-title">{title} <em>{titleEm}</em></h1>
          {blurb && <p className="category-blurb">{blurb}</p>}
        </div>

        {!productsLoaded && items.length === 0 ? (
          <div className="bs-no-results">Loading…</div>
        ) : items.length === 0 ? (
          <div className="category-empty">
            <div className="category-empty-title">New arrivals are on their way</div>
            <p>We haven't listed anything in this category yet. In the meantime, have a look at the rest of the store.</p>
            <div className="category-empty-actions">
              <button className="btn-skin" onClick={() => setPage("skincare")}>Shop Skincare</button>
              <button className="btn-skin category-empty-alt" onClick={() => setPage("makeup")}>Shop Makeup</button>
            </div>
          </div>
        ) : (
          <div className="products-grid">
            {items.map(p => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}

export default CategoryBrowsePage;
