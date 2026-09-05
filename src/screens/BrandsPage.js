import { useState } from "react";
import { allBrands } from "../data/brands.js";

function BrandsPage({ setPage, goToProducts }) {
  const [filter, setFilter] = useState("All");
  const categories = ["All", "Skincare", "Makeup", "Fragrance", "Hair & Body"];
  const filtered = filter === "All" ? allBrands : allBrands.filter(b => b.tag === filter);

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
        <div className="brands-grid">
          {filtered.map(b => (
            <div key={b.name} className="brand-card">
              <div className="brand-card-emoji">{b.emoji}</div>
              <div className="brand-card-origin">{b.origin}</div>
              <div className="brand-card-name">{b.name}</div>
              <div className="brand-card-desc">{b.desc}</div>
              <div className="brand-card-footer">
                <div className="brand-auth-pill">✓ 100% Authentic</div>
                <div className="brand-category-pill">{b.category}</div>
              </div>
            </div>
          ))}
        </div>
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
