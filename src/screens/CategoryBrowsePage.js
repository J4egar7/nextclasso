import ProductCard from "../components/ProductCard.js";

function CategoryBrowsePage({
  eyebrow, title, titleEm, blurb, categories, pageTag,
  products, productsLoaded, addToCart, toggleFavourite, isFav, openProduct, setPage,
}) {
  const items = (products || []).filter(p => categories.includes(p.category));

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
            {items.map(p => <ProductCard key={p.id} p={p} pageTag={pageTag} addToCart={addToCart} toggleFavourite={toggleFavourite} isFav={isFav} openProduct={openProduct} />)}
          </div>
        )}
      </section>
    </div>
  );
}

export default CategoryBrowsePage;
