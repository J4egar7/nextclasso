import { teamMembers } from "../data/brands.js";

function AboutPage({ setPage, goToProducts }) {
  return (
    <div className="page page-enter">

      {/* HERO */}
      <section className="about-hero">
        <div className="about-blob1" />
        <div className="about-blob2" />
        <div className="about-content">
          <div className="about-tag">✦ Our Story</div>
          <h1 className="about-title">
            Born from a<br />
            love of<br />
            <span className="orange">beauty</span> &<br />
            <span className="sage">authenticity</span>
          </h1>
          <p className="about-body">
            CLASO began as a Shopify store in late 2022 — a small passion project born in a Lahore apartment. We started with just a handful of K-beauty picks and a big dream. Today we serve 15,000+ customers across Pakistan with authentic, globally-sourced beauty products, carefully curated and delivered with love.
          </p>
          <button className="btn-about" onClick={() => goToProducts("skincare")}>Shop Now</button>
        </div>
      </section>

      {/* STATS */}
      <div className="about-stats">
        <div className="about-stats-grid">
          {[
            { num:"15K+", label:"Happy Customers" },
            { num:"2,300+", label:"Positive Reviews" },
            { num:"200+", label:"Premium Brands" },
            { num:"4+", label:"Years of Love" },
          ].map(s => (
            <div key={s.label}>
              <div className="a-stat-num">{s.num}</div>
              <div className="a-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* VALUES */}
      <section className="about-values">
        <h2 className="about-val-title">What we <span>stand for</span></h2>
        <div className="values-grid">
          {[
            { icon:"🌿", cls:"sage", name:"100% Authentic", desc:"Every single product is sourced directly from brands or authorised distributors. Zero grey-market products — ever." },
            { icon:"🌍", cls:"orange", name:"Globally Curated", desc:"We travel the world (and the internet) to bring you the best of K-Beauty, US, UK and European brands." },
            { icon:"♻️", cls:"sage", name:"Sustainable Beauty", desc:"We prioritise brands committed to eco-conscious packaging and cruelty-free formulations." },
            { icon:"💛", cls:"orange", name:"Community First", desc:"We're more than a store. We're a beauty community of over 15,000 people who support each other's glow journeys." },
          ].map(v => (
            <div key={v.name} className="value-card">
              <div className={`value-icon ${v.cls}`}>{v.icon}</div>
              <div className="value-name">{v.name}</div>
              <div className="value-desc">{v.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* MANIFESTO */}
      <div style={{ background: "var(--about-accent)", padding: "100px 8vw", textAlign: "center" }}>
        <div style={{ fontFamily: "Bebas Neue", fontSize: "13px", letterSpacing: "5px", color: "var(--about-primary)", marginBottom: "24px" }}>
          OUR MANIFESTO
        </div>
        <blockquote style={{ fontFamily: "Cormorant Garamond", fontSize: "clamp(24px,3.5vw,44px)", color: "var(--about-dark)", fontStyle: "italic", lineHeight: 1.4, maxWidth: "800px", margin: "0 auto 40px" }}>
          "Every skin tells a story. We're here to help you write yours — with confidence, care, and a whole lot of glow."
        </blockquote>
        <div style={{ fontSize: "16px", color: "rgba(26,8,0,0.5)", fontWeight: 500 }}>— The Founder of CLASO</div>
      </div>
    </div>
  );
}

export default AboutPage;
