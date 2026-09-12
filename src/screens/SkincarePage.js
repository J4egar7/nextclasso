import { useState } from "react";
import { skincareProducts } from "../data/products.js";
import { skincareReviews } from "../data/reviews.js";
import { skincareConcerns } from "../data/filters.js";

function SkincarePage({ addToCart, goToProducts, toggleFavourite, isFav, openProduct, adminProducts }) {
  // Merge in admin-published products for this category (live from Firestore)
  const skincareProductsAll = [
    ...skincareProducts,
    ...(adminProducts || []).filter(p => p.category === "Skincare"),
  ];
  const [sortBy, setSortBy] = useState("rating");
  const [showAll, setShowAll] = useState(false);
  const [activeConcern, setActiveConcern] = useState(null);
  const [filterCat, setFilterCat] = useState("All");
  const [filterBrand, setFilterBrand] = useState("All");
  const [filterRating, setFilterRating] = useState("All");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const skinCategories = ["All","Cleansers","Serums","Moisturisers","SPF","Masks","Eye Care","Toners","Oils"];
  const skinBrands = ["All", ...Array.from(new Set(skincareProductsAll.map(p => p.brand))).sort()];
  const ratingOptions = ["All","4.9+","4.7+","4.5+"];

  const sortFn = (a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "purchases") return b.purchases - a.purchases;
    if (sortBy === "views") return b.views - a.views;
    return 0;
  };

  const bestsellers = [...skincareProductsAll].sort(sortFn).slice(0, 6);

  const applyFilters = (products) => {
    return products.filter(p => {
      if (filterCat !== "All" && p.category !== filterCat) return false;
      if (filterBrand !== "All" && p.brand !== filterBrand) return false;
      if (filterRating !== "All") {
        const min = parseFloat(filterRating);
        if (p.rating < min) return false;
      }
      const min = priceMin ? parseInt(priceMin) : 0;
      const max = priceMax ? parseInt(priceMax) : Infinity;
      if (p.priceNum < min || p.priceNum > max) return false;
      return true;
    }).sort(sortFn);
  };

  const allFiltered = applyFilters(skincareProductsAll);
  const resetFilters = () => { setFilterCat("All"); setFilterBrand("All"); setFilterRating("All"); setPriceMin(""); setPriceMax(""); };
  const hasActiveFilters = filterCat !== "All" || filterBrand !== "All" || filterRating !== "All" || priceMin || priceMax;
  const activeFilterCount = [filterCat !== "All", filterBrand !== "All", filterRating !== "All", !!priceMin, !!priceMax].filter(Boolean).length;

  const filterPanel = (
    <>
      <div className="filter-group">
        <div className="filter-group-label">Category</div>
        <div className="filter-chips">
          {skinCategories.map(c => (
            <button key={c} className={`filter-chip skin-chip ${filterCat===c?"active":""}`} onClick={() => setFilterCat(c)}>{c}</button>
          ))}
        </div>
      </div>
      <div className="filter-group">
        <div className="filter-group-label">Minimum Rating</div>
        <div className="filter-chips">
          {ratingOptions.map(r => (
            <button key={r} className={`filter-chip skin-chip ${filterRating===r?"active":""}`} onClick={() => setFilterRating(r)}>{r === "All" ? "Any" : r}</button>
          ))}
        </div>
      </div>
      <div className="filter-group">
        <div className="filter-group-label">Price Range (PKR)</div>
        <div className="price-range-row">
          <input className="price-range-input skin" placeholder="Min" value={priceMin} onChange={e => setPriceMin(e.target.value)} type="number" step="1000" min="0" />
          <span style={{color:"rgba(28,15,20,0.3)",fontSize:"12px"}}>—</span>
          <input className="price-range-input skin" placeholder="Max" value={priceMax} onChange={e => setPriceMax(e.target.value)} type="number" step="1000" min="0" />
        </div>
      </div>
      <div className="filter-group">
        <div className="filter-group-label">Brand</div>
        <div className="filter-chips">
          {skinBrands.slice(0,12).map(b => (
            <button key={b} className={`filter-chip skin-chip ${filterBrand===b?"active":""}`} onClick={() => setFilterBrand(b)}>{b}</button>
          ))}
        </div>
      </div>
    </>
  );

  const ProductCard = ({ p }) => (
    <div className="skin-product-card" onClick={() => openProduct({ ...p, _prevPage: "skincare" })}>
      <div className="skin-img" style={{ background: p.bg }}>
        <span style={{fontSize:'52px'}}>{p.emoji}</span>
        {p.badge && <div className="skin-badge">{p.badge}</div>}
        <button className="product-wish-btn" onClick={e => { e.stopPropagation(); toggleFavourite({ ...p, _pageTag: "skincare" }); }}>{isFav(p.id) ? "❤️" : "🤍"}</button>
      </div>
      <div className="skin-info">
        <div className="skin-brand">{p.brand}</div>
        <div className="skin-name">{p.name}</div>
        <div className="skin-desc">{p.desc}</div>
        <div style={{display:"flex",alignItems:"center",gap:"5px",marginBottom:"10px"}}>
          <span style={{color:"var(--skin-secondary)",fontSize:"12px"}}>{"★".repeat(Math.floor(p.rating))}</span>
          <span style={{fontSize:"11px",color:"rgba(28,15,20,0.4)"}}>({p.reviews.toLocaleString()})</span>
        </div>
        <div className="skin-footer">
          <div className="skin-price">{p.price}</div>
          <button className="add-btn-skin" onClick={e => { e.stopPropagation(); addToCart(p); }}>+</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page page-enter">
            {/* SITE OPENING SALE BANNER */}
      <div className="sale-banner">
        <div className="sale-banner-icon">🎉</div>
        <div className="sale-banner-top">
          <span className="sale-banner-pulse" />
          <span className="sale-banner-tag">Site Opening Sale</span>
          <span className="sale-banner-divider" />
          <span className="sale-banner-tag">Limited Time Only</span>
        </div>
        <div className="sale-banner-text"><em>50% OFF</em> everything sitewide</div>
      </div>
      {/* HERO */}
      <section className="skincare-hero">
        <div className="skin-blob skin-blob-1" />
        <div className="skin-blob skin-blob-2" />
        <div className="skincare-hero-content">
          <div className="skin-tag">✦ Skincare Edit 2026</div>
          <h1 className="skin-title">Feed your<br />skin with<br /><span className="gold">pure gold</span></h1>
          <p className="skin-sub">Science-backed formulas. Skin-transforming rituals. Every product vetted by our beauty experts for real, visible results.</p>
          <button className="btn-skin" onClick={() => document.getElementById('skin-bestsellers').scrollIntoView({behavior:'smooth'})}>
            Explore All Products
          </button>
        </div>
        <div className="skin-hero-visual">
          <div className="skin-orb">🌿</div>
          <div className="skin-float-card sf1"><div className="skin-float-icon">💧</div><div className="skin-float-label">Hyaluronic Acid</div><div className="skin-float-val">Deep hydration</div></div>
          <div className="skin-float-card sf2"><div className="skin-float-icon">✨</div><div className="skin-float-label">Niacinamide</div><div className="skin-float-val">Pore perfector</div></div>
          <div className="skin-float-card sf3"><div className="skin-float-icon">🌸</div><div className="skin-float-label">Retinol</div><div className="skin-float-val">Age-defying</div></div>
        </div>
      </section>

      {/* CONCERNS — clicking filters the all-products list */}
      <section className="concerns-section">
        <h2 className="concern-title">Shop by <span>skin concern</span></h2>
        <div className="concerns-grid">
          {skincareConcerns.map(c => (
            <div key={c.name} className={`concern-card`}
              style={{ cursor:"pointer", outline: activeConcern === c.name ? "2.5px solid var(--skin-primary)" : "none", transform: activeConcern === c.name ? "translateY(-4px)" : "none", transition:"all 0.2s" }}
              onClick={() => {
                const next = activeConcern === c.name ? null : c.name;
                setActiveConcern(next);
                setFilterCat(next ? c.filterCat || "All" : "All");
                setShowAll(true);
                setTimeout(() => document.getElementById('skin-all-products')?.scrollIntoView({behavior:'smooth'}), 50);
              }}>
              <div className="concern-icon">{c.icon}</div>
              <div className="concern-name">{c.name}</div>
              <div className="concern-count">{c.count}</div>
            </div>
          ))}
        </div>
      </section>

      {/* BESTSELLERS */}
      <section className="skin-section" id="skin-bestsellers">
        <div className="bs-header-row">
          <div>
            <div className="skin-eyebrow">✦ Carefully Curated</div>
            <h2 className="skin-section-title">Our bestselling <em>skincare</em></h2>
          </div>
          <select className="sort-select skin" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="rating">⭐ Top Rated</option>
            <option value="purchases">🛍️ Most Purchased</option>
            <option value="views">👁️ Most Viewed</option>
          </select>
        </div>
        <div className="products-grid">
          {bestsellers.map(p => <ProductCard key={p.id} p={p} />)}
        </div>
        <button className="view-all-btn skin" onClick={() => { setShowAll(true); setTimeout(() => document.getElementById('skin-all-products')?.scrollIntoView({behavior:'smooth'}), 50); }}>
          ✦ View All {skincareProductsAll.length} Skincare Products
        </button>
      </section>

      {/* ALL PRODUCTS — shown when View All clicked or concern selected */}
      {showAll && (
        <section className="pl-wrap skin-listing" id="skin-all-products">
          <div className="pl-header">
            <span style={{fontFamily:"Playfair Display,serif",fontSize:"22px",fontWeight:700,color:"var(--skin-dark)"}}>
              All Skincare
              <span className="pl-count">({allFiltered.length} products{hasActiveFilters ? " — filtered" : ""})</span>
            </span>
            <button className="btn-skin" style={{padding:"10px 22px",fontSize:"13px"}} onClick={() => setShowAll(false)}>Hide List ↑</button>
          </div>
          <div className="pl-layout">
            {/* FILTER SIDEBAR (desktop only — collapses to a sheet on mobile) */}
            <aside className="filter-sidebar skin">
              <div className="filter-sidebar-title">Filters</div>
              {filterPanel}
              {hasActiveFilters && <button className="filter-reset skin" onClick={resetFilters}>✕ Reset Filters</button>}
              <button className="filter-reset skin" style={{marginTop:"8px",background:"rgba(201,116,143,0.06)",color:"rgba(28,15,20,0.5)"}} onClick={() => setShowAll(false)}>↑ Hide List</button>
            </aside>
            {/* PRODUCT GRID */}
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px",gap:"10px"}}>
                <button className="mobile-filter-trigger" onClick={() => setMobileFiltersOpen(true)}>
                  ⚙ Filters
                  {activeFilterCount > 0 && <span className="mf-trigger-count">{activeFilterCount}</span>}
                </button>
                <select className="sort-select skin" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="rating">⭐ Top Rated</option>
                  <option value="purchases">🛍️ Most Purchased</option>
                  <option value="views">👁️ Most Viewed</option>
                </select>
              </div>
              {allFiltered.length === 0 ? (
                <div className="bs-no-results">No products match your filters.<br/><button className="filter-reset skin" style={{display:"inline-block",marginTop:"12px",width:"auto",padding:"10px 20px"}} onClick={resetFilters}>Reset Filters</button></div>
              ) : (
                <div className="products-grid">
                  {allFiltered.map(p => <ProductCard key={p.id} p={p} />)}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* MOBILE FILTER SHEET */}
      {mobileFiltersOpen && (
        <>
          <div className="mf-overlay" onClick={() => setMobileFiltersOpen(false)} />
          <div className="mf-sheet skin">
            <div className="mf-sheet-handle" />
            <div className="mf-sheet-header">
              <div className="mf-sheet-title">Filters</div>
              <button className="mf-sheet-close" onClick={() => setMobileFiltersOpen(false)}>✕</button>
            </div>
            <div className="mf-sheet-body">{filterPanel}</div>
            <div className="mf-sheet-footer">
              {hasActiveFilters && <button className="mf-sheet-reset-sm" onClick={resetFilters}>Reset</button>}
              <button className="mf-sheet-apply" onClick={() => setMobileFiltersOpen(false)}>Show {allFiltered.length} Results</button>
            </div>
          </div>
        </>
      )}

      {/* FLOATING BOTTOM-LEFT FILTER BUTTON — only while browsing all products */}
      {showAll && (
        <button className="floating-filter-btn skin" onClick={() => setMobileFiltersOpen(true)} aria-label="Filter products">
          ⚙
          {activeFilterCount > 0 && <span className="mf-trigger-count">{activeFilterCount}</span>}
        </button>
      )}

      {/* SKINCARE QUOTES */}
      <section className="reviews-section">
        <div className="reviews-header">
          <div className="reviews-eyebrow" style={{ color: "var(--skin-secondary)" }}>✦ Real Skin, Real Stories</div>
          <h2 className="reviews-title">Our customers <br/><em>glow different</em></h2>
        </div>
        <div className="reviews-track-outer">
          <div className="reviews-track">
            {[...skincareReviews, ...skincareReviews].map((r, i) => (
              <div key={i} className="review-card">
                <div className="review-stars" style={{ color: "var(--skin-secondary)" }}>{"★".repeat(r.rating)}</div>
                <p className="review-text">"{r.text}"</p>
                <div className="review-author">
                  <div className="review-avatar" style={{ background: "rgba(201,116,143,0.2)" }}>{r.avatar}</div>
                  <div><div className="review-name">{r.name}</div><div className="review-product">{r.product}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SKINCARE MANIFESTO */}
      <div style={{ background: "var(--skin-accent)", padding: "clamp(48px, 10vw, 100px) 8vw", textAlign: "center" }}>
        <div style={{ fontFamily: "Bebas Neue", fontSize: "13px", letterSpacing: "5px", color: "var(--skin-primary)", marginBottom: "24px" }}>OUR SKINCARE PHILOSOPHY</div>
        <blockquote style={{ fontFamily: "Cormorant Garamond", fontSize: "clamp(24px,3.5vw,44px)", color: "var(--skin-dark)", fontStyle: "italic", lineHeight: 1.4, maxWidth: "800px", margin: "0 auto 40px" }}>
          "Great skin isn't born — it's built. With the right ingredients, the right routine, and a little patience."
        </blockquote>
        <div style={{ fontSize: "16px", color: "rgba(28,15,20,0.45)", fontWeight: 500 }}>— CLASO Beauty Experts</div>
      </div>

      {/* NEWSLETTER */}
      <section className="newsletter" style={{ background: "var(--skin-secondary)", borderRadius: 0 }}>
        <div className="newsletter-title" style={{ fontFamily: "Playfair Display", color: "white" }}>Get skincare tips & exclusive deals 🌸</div>
        <p className="newsletter-sub" style={{ color: "rgba(255,255,255,0.75)" }}>Join 15,000+ beauty enthusiasts in our community</p>
        <div className="newsletter-form">
          <input className="newsletter-input" placeholder="your@email.com" />
          <button className="newsletter-btn" style={{ background: "var(--skin-primary)" }}>Join Now</button>
        </div>
      </section>
    </div>
  );
}

export default SkincarePage;
