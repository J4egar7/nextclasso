import { useState } from "react";
import { SKINCARE_CATEGORIES, MAKEUP_CATEGORIES } from "../data/constants.js";

const tagOf = (category) =>
  SKINCARE_CATEGORIES.includes(category) ? "Skincare"
  : MAKEUP_CATEGORIES.includes(category) ? "Makeup"
  : category; // "Fragrance" / "Hair & Body"

// Builds the brand list from the live product catalog, so it can never drift
// from what the store actually sells.
function brandsFromProducts(products) {
  const map = new Map();
  (products || []).forEach(p => {
    const name = (p.brand || "").trim();
    if (!name) return;
    const key = name.toLowerCase();
    if (!map.has(key)) map.set(key, { name, emoji: "", count: 0, tags: new Set() });
    const b = map.get(key);
    b.count += 1;
    if (!b.emoji && p.emoji) b.emoji = p.emoji;
    b.tags.add(tagOf(p.category));
  });
  return [...map.values()]
    .map(b => ({ ...b, tags: [...b.tags] }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function BrandsPage({ setPage, goToProducts, products }) {
  const [filter, setFilter] = useState("All");
  const categories = ["All", "Skincare", "Makeup", "Fragrance", "Hair & Body"];
  const allBrands = brandsFromProducts(products);
  const filtered = filter === "All" ? allBrands : allBrands.filter(b => b.tags.includes(filter));

  return (
    <div className="page page-enter">
      {/* HERO */}
      <section className="brands-hero">
        <div className="brands-hero-bg" />
        <div className="brands-hero-content">
          <div className="brands-tag">✦ Our Brand Family</div>
          <h1 className="brands-hero-title">
            Every brand.<br />
            Every product.<br />
            <span className="coral">100% real.</span>
          </h1>
          <p className="brands-hero-sub">We partner directly with authorised distributors and brand offices so you never have to question authenticity. Every item is vetted before it reaches your door.</p>
          <div className="authenticity-badge">
            <div className="auth-num">100%</div>
            <div className="auth-text">
              <div className="auth-text-main">Authenticity Guaranteed</div>
              <div className="auth-text-sub">Direct sourcing · Authorised distributors · Zero grey market</div>
            </div>
          </div>
        </div>
      </section>

      {/* BRANDS GRID */}
      <section className="brands-section">
        <div className="brands-section-eyebrow">✦ Our Curated Edit</div>
        <h2 className="brands-section-title">The brands we <em>love & carry</em></h2>
        <div className="brands-filter-row">
          {categories.map(c => (
            <button key={c} className={`brand-filter-btn ${filter === c ? "active" : ""}`} onClick={() => setFilter(c)}>{c}</button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <p style={{ textAlign: "center", color: "rgba(26,10,10,0.5)", padding: "40px 0" }}>
            {allBrands.length === 0 ? "Brands will appear here as products are added to the store." : "No brands in this category yet."}
          </p>
        ) : (
          <div className="brands-grid">
            {filtered.map(b => (
              <div key={b.name} className="brand-card">
                <div className="brand-card-emoji">{b.emoji || "🏷️"}</div>
                <div className="brand-card-origin">{b.count} {b.count === 1 ? "product" : "products"}</div>
                <div className="brand-card-name">{b.name.toUpperCase()}</div>
                <div className="brand-card-footer">
                  <div className="brand-auth-pill">✓ 100% Authentic</div>
                  <div className="brand-category-pill">{b.tags.join(" · ")}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* PROMISE SECTION */}
      <div className="brands-promise">
        <div style={{ fontFamily: "Bebas Neue", fontSize: "13px", letterSpacing: "5px", color: "var(--home-primary)", marginBottom: "28px" }}>OUR AUTHENTICITY PROMISE</div>
        <div className="brands-promise-title">
          "We'd rather carry fewer brands<br />
          than carry a single <span>fake product.</span>"
        </div>
        <p className="brands-promise-sub">Every product you order from CLASO comes sealed, tracked, and sourced directly from brand offices or their authorised regional distributors. Our 100% authenticity guarantee isn't a slogan — it's our non-negotiable standard.</p>
        <button className="btn-primary" style={{ marginTop: "40px" }} onClick={() => goToProducts("skincare")}>Shop With Confidence →</button>
      </div>
    </div>
  );
}

export default BrandsPage;
