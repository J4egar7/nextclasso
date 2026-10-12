import { useState } from "react";
import { makeupConcerns, shades } from "../data/filters.js";
import { MAKEUP_CATEGORIES } from "../data/constants.js";
import Link from "next/link";

function MakeupPage({ addToCart, goToProducts, toggleFavourite, isFav, openProduct, products }) {
  // All makeup products now come straight from Supabase — a product
  // belongs on this page if its category is one of the fine-grained
  // makeup categories (Lips, Eyes, etc.), same categories the filter
  // tabs below use, so admin-added products filter correctly too.
  const makeupProductsAll = (products || []).filter(p => MAKEUP_CATEGORIES.includes(p.category));
  const [sortBy, setSortBy] = useState("rating");
  const [showAll, setShowAll] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [filterCat, setFilterCat] = useState("All");
  const [filterBrand, setFilterBrand] = useState("All");
  const [filterRating, setFilterRating] = useState("All");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const makeCategories = ["All", ...MAKEUP_CATEGORIES];
  const makeBrands = ["All", ...Array.from(new Set(makeupProductsAll.map(p => p.brand))).sort()];
  const ratingOptions = ["All","4.9+","4.7+","4.5+"];

  const sortFn = (a, b) => {
    if (sortBy === "rating") return (b.rating||0) - (a.rating||0);
    if (sortBy === "purchases") return (b.purchases||0) - (a.purchases||0);
    if (sortBy === "views") return (b.views||0) - (a.views||0);
    return 0;
  };

  const bestsellers = [...makeupProductsAll].sort(sortFn).slice(0, 6);

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

  const allFiltered = applyFilters(makeupProductsAll);
  const resetFilters = () => { setFilterCat("All"); setFilterBrand("All"); setFilterRating("All"); setPriceMin(""); setPriceMax(""); };
  const hasActiveFilters = filterCat !== "All" || filterBrand !== "All" || filterRating !== "All" || priceMin || priceMax;
  const activeFilterCount = [filterCat !== "All", filterBrand !== "All", filterRating !== "All", !!priceMin, !!priceMax].filter(Boolean).length;

  const filterPanel = (
    <>
      <div className="filter-group">
        <div className="filter-group-label" style={{color:"rgba(255,255,255,0.4)"}}>Category</div>
        <div className="filter-chips">
          {makeCategories.map(c => (
            <button key={c} className={`filter-chip make-chip ${filterCat===c?"active":""}`} onClick={() => setFilterCat(c)}>{c}</button>
          ))}
        </div>
      </div>
      <div className="filter-group">
        <div className="filter-group-label" style={{color:"rgba(255,255,255,0.4)"}}>Minimum Rating</div>
        <div className="filter-chips">
          {ratingOptions.map(r => (
            <button key={r} className={`filter-chip make-chip ${filterRating===r?"active":""}`} onClick={() => setFilterRating(r)}>{r === "All" ? "Any" : r}</button>
          ))}
        </div>
      </div>
      <div className="filter-group">
        <div className="filter-group-label" style={{color:"rgba(255,255,255,0.4)"}}>Price Range (PKR)</div>
        <div className="price-range-row">
          <input className="price-range-input make" placeholder="Min" value={priceMin} onChange={e => setPriceMin(e.target.value)} type="number" step="1000" min="0" />
          <span style={{color:"rgba(255,255,255,0.2)",fontSize:"12px"}}>—</span>
          <input className="price-range-input make" placeholder="Max" value={priceMax} onChange={e => setPriceMax(e.target.value)} type="number" step="1000" min="0" />
        </div>
      </div>
      <div className="filter-group">
        <div className="filter-group-label" style={{color:"rgba(255,255,255,0.4)"}}>Brand</div>
        <div className="filter-chips">
          {makeBrands.slice(0,12).map(b => (
            <button key={b} className={`filter-chip make-chip ${filterBrand===b?"active":""}`} onClick={() => setFilterBrand(b)}>{b}</button>
          ))}
        </div>
      </div>
    </>
  );

  const ProductCard = ({ p }) => (
    <div className="make-product-card" style={{ "--accent": p.accent }} data-soldout={p.stock <= 0 ? "true" : undefined} onClick={() => openProduct({ ...p, _prevPage: "makeup" })}>
      <div className="make-img" style={{ background: p.bg }}>
        {p.images?.[0]
          ? <img src={p.images[0]} alt={p.name} loading="lazy" decoding="async" style={{ width:"100%", height:"100%", objectFit:"contain", position:"absolute", inset:0 }} />
          : <span style={{fontSize:'52px'}}>{p.emoji}</span>}
        {p.badge && <div className="make-badge">{p.badge}</div>}
        <button className="product-wish-btn" aria-label={`Save ${p.name}`} onClick={e => { e.stopPropagation(); toggleFavourite({ ...p, _pageTag: "makeup" }); }}>{isFav(p.id) ? "❤️" : "🤍"}</button>
      </div>
      <div className="make-info">
        <div className="make-brand">{p.brand}</div>
        <div className="make-name"><Link href={`/product/${p.id}?from=makeup`} className="plink" onClick={e => e.stopPropagation()}>{p.name}</Link></div>
        <div className="make-desc">{p.desc}</div>
        <div style={{display:"flex",alignItems:"center",gap:"5px",marginBottom:"10px"}}>
          <span style={{color:"#FF6BC8",fontSize:"12px"}}>{"★".repeat(Math.floor(p.rating))}</span>
          <span style={{fontSize:"11px",color:"rgba(255,255,255,0.3)"}}>({p.reviews.toLocaleString()})</span>
        </div>
        <div className="make-footer">
          <div className="make-price">{p.price}</div>
          <button className="add-btn-make" aria-label={`Add ${p.name} to cart`} onClick={e => { e.stopPropagation(); addToCart(p); }}>+</button>
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

      {/* MAKEUP COMING SOON BANNER */}
      <div className="makeup-coming-banner">
        <span className="makeup-coming-icon">💄</span>
        <div className="makeup-coming-content">
          <div className="makeup-coming-title">Full Makeup Catalogue <em>Coming Soon</em></div>
          <div className="makeup-coming-sub">Our complete collection is on its way — enjoy our curated preview edit below while we put the finishing touches on the full range.</div>
        </div>
        <span className="makeup-coming-badge">Preview Edition</span>
      </div>

      {/* HERO */}
      <section className="makeup-hero">
        <div className="make-particle make-p1" />
        <div className="make-particle make-p2" />
        <div className="make-particle make-p3" />
        <div className="makeup-hero-content">
          <div className="make-tag">✦ Makeup Drop 2026</div>
          <h1 className="make-title"><span className="pink">Bold.</span><br /><span className="blue">Beautiful.</span><br />Unapologetic.</h1>
          <p className="make-sub">From bold statement lips to skin-perfecting base products — our makeup edit is your permission to play, experiment, and shine.</p>
          <button className="btn-make" onClick={() => document.getElementById('make-bestsellers').scrollIntoView({behavior:'smooth'})}>
            Shop the Look
          </button>
        </div>
        <div className="make-hero-visual">
          <div className="make-orb">💄</div>
          <div className="make-float-card mf1"><div className="make-float-icon">👄</div><div className="make-float-label">Statement Lips</div><div className="make-float-val">44 shades available</div></div>
          <div className="make-float-card mf2"><div className="make-float-icon">✨</div><div className="make-float-label">Glow Finish</div><div className="make-float-val">Long-wearing formula</div></div>
          <div className="make-float-card mf3"><div className="make-float-icon">🎭</div><div className="make-float-label">Eye Art</div><div className="make-float-val">Ultra-pigmented</div></div>
        </div>
      </section>

      {/* SHADES */}
      <section className="shades-section">
        <h2 className="shades-title">44 <span>inclusive</span> shades for every skin tone</h2>
        <div className="shades-row">
          {shades.map((s, i) => <div key={i} className="shade-swatch" style={{ background: s }} title={`Shade ${i+1}`} />)}
        </div>
      </section>

      {/* CATEGORY CARDS — same card UI as skincare concerns */}
      <section className="makeup-concerns-section">
        <h2 className="concern-title" style={{color:"white"}}>What are you <span style={{color:"var(--make-primary)",fontStyle:"italic"}}>looking for?</span></h2>
        <div className="concerns-grid">
          {makeupConcerns.map(c => (
            <div key={c.name}
              className="concern-card makeup-concern-card"
              style={{
                cursor:"pointer",
                outline: activeCategory === c.name ? "2.5px solid var(--make-primary)" : "none",
                transform: activeCategory === c.name ? "translateY(-4px)" : "none",
                transition:"all 0.2s",
                background: activeCategory === c.name ? "rgba(233,30,140,0.15)" : "rgba(255,255,255,0.06)",
                borderColor: activeCategory === c.name ? "rgba(233,30,140,0.35)" : "rgba(255,255,255,0.08)"
              }}
              onClick={() => {
                const next = activeCategory === c.name ? null : c.name;
                setActiveCategory(next);
                setFilterCat(next ? c.filterCat : "All");
                setShowAll(true);
                setTimeout(() => document.getElementById('make-all-products')?.scrollIntoView({behavior:'smooth'}), 50);
              }}>
              <div className="concern-icon">{c.icon}</div>
              <div className="concern-name">{c.name}</div>
              <div className="concern-count">{c.count}</div>
            </div>
          ))}
        </div>
      </section>

      {/* BESTSELLERS */}
      <section className="makeup-section" id="make-bestsellers">
        <div className="bs-header-row">
          <div>
            <div className="make-eyebrow">✦ The Edit</div>
            <h2 className="make-section-title">Must-have <em>makeup</em></h2>
          </div>
          <select className="sort-select make" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="rating">⭐ Top Rated</option>
            <option value="purchases">🛍️ Most Purchased</option>
            <option value="views">👁️ Most Viewed</option>
          </select>
        </div>
        <div className="products-grid">
          {bestsellers.map(p => <ProductCard key={p.id} p={p} />)}
        </div>
        <button className="view-all-btn make" onClick={() => { setShowAll(true); setTimeout(() => document.getElementById('make-all-products')?.scrollIntoView({behavior:'smooth'}), 50); }}>
          ✦ View All {makeupProductsAll.length} Makeup Products
        </button>
      </section>

      {/* ALL PRODUCTS */}
      {showAll && (
        <section style={{padding:"0 8vw 80px",background:"var(--make-dark)"}} id="make-all-products">
          <div className="pl-header">
            <span style={{fontFamily:"Playfair Display,serif",fontSize:"22px",fontWeight:700,color:"white"}}>
              All Makeup
              <span style={{fontSize:"13px",opacity:0.35,marginLeft:"8px",fontWeight:400}}>({allFiltered.length} products{hasActiveFilters ? " — filtered" : ""})</span>
            </span>
            <button className="btn-make" style={{padding:"10px 22px",fontSize:"13px"}} onClick={() => setShowAll(false)}>Hide List ↑</button>
          </div>
          <div className="pl-layout">
            {/* FILTER SIDEBAR (desktop only — collapses to a sheet on mobile) */}
            <aside className="filter-sidebar make">
              <div className="filter-sidebar-title">Filters</div>
              {filterPanel}
              {hasActiveFilters && <button className="filter-reset make" onClick={resetFilters}>✕ Reset Filters</button>}
              <button className="filter-reset make" style={{marginTop:"8px",background:"rgba(233,30,140,0.05)",color:"rgba(255,255,255,0.35)"}} onClick={() => setShowAll(false)}>↑ Hide List</button>
            </aside>
            {/* PRODUCT GRID */}
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px",gap:"10px"}}>
                <button className="mobile-filter-trigger make" onClick={() => setMobileFiltersOpen(true)}>
                  ⚙ Filters
                  {activeFilterCount > 0 && <span className="mf-trigger-count">{activeFilterCount}</span>}
                </button>
                <select className="sort-select make" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="rating">⭐ Top Rated</option>
                  <option value="purchases">🛍️ Most Purchased</option>
                  <option value="views">👁️ Most Viewed</option>
                </select>
              </div>
              {allFiltered.length === 0 ? (
                <div className="bs-no-results" style={{color:"rgba(255,255,255,0.4)"}}>No products match your filters.<br/><button className="filter-reset make" style={{display:"inline-block",marginTop:"12px",width:"auto",padding:"10px 20px"}} onClick={resetFilters}>Reset Filters</button></div>
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
          <div className="mf-sheet make">
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
        <button className="floating-filter-btn make" onClick={() => setMobileFiltersOpen(true)} aria-label="Filter products">
          ⚙
          {activeFilterCount > 0 && <span className="mf-trigger-count">{activeFilterCount}</span>}
        </button>
      )}

      {/* MAKEUP MANIFESTO */}
      <div style={{ background: "var(--make-light)", padding: "clamp(48px, 10vw, 100px) 8vw", textAlign: "center" }}>
        <div style={{ fontFamily: "Bebas Neue", fontSize: "13px", letterSpacing: "5px", color: "var(--make-primary)", marginBottom: "24px" }}>OUR MAKEUP PHILOSOPHY</div>
        <blockquote style={{ fontFamily: "Cormorant Garamond", fontSize: "clamp(24px,3.5vw,44px)", color: "var(--make-dark)", fontStyle: "italic", lineHeight: 1.4, maxWidth: "800px", margin: "0 auto 40px" }}>
          "Makeup isn't about hiding — it's about showing up as the most expressive, unapologetic version of yourself."
        </blockquote>
        <div style={{ fontSize: "16px", color: "rgba(10,0,32,0.4)", fontWeight: 500 }}>— CLASO Makeup Edit</div>
      </div>
    </div>
  );
}

export default MakeupPage;
