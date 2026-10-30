// Dreamy cloud hero — CLASO take on the "POWERFUL. PURE. Gentle" product hero.
// Photo: Ernest Brillo / Unsplash. The bottle is pure CSS so you can swap it
// for a real transparent PNG later (replace the .cloud-bottle block with an <img>).
const CLOUD_BG =
  "https://images.unsplash.com/photo-1534271057238-c2c170a76672?auto=format&fit=crop&w=2200&q=80";

const BUBBLES = [
  { l: "14%", t: "16%", s: 74, d: 0 },
  { l: "80%", t: "14%", s: 58, d: 1.2 },
  { l: "7%",  t: "58%", s: 38, d: 2.1 },
  { l: "88%", t: "54%", s: 30, d: 0.6 },
  { l: "30%", t: "70%", s: 54, d: 1.7 },
  { l: "64%", t: "72%", s: 42, d: 2.6 },
];

export default function CloudHero({ productCount = 0, brandCount = 0, goToProducts }) {
  return (
    <section className="cloud-hero">
      <div className="cloud-hero-bg" style={{ backgroundImage: `url('${CLOUD_BG}')` }} />
      <div className="cloud-hero-wash" />

      {BUBBLES.map((b, i) => (
        <span
          key={i}
          className="cloud-bubble"
          aria-hidden="true"
          style={{ left: b.l, top: b.t, width: b.s, height: b.s, animationDelay: `${b.d}s` }}
        />
      ))}

      <div className="cloud-hero-tag">New Arrivals ✦ Spring 2026</div>

      <h1 className="cloud-hero-title" aria-label="Powerful. Pure. Gentle.">
        <span className="ch-line ch-l1" aria-hidden="true">POWERFUL.</span>
        <span className="ch-line ch-l2" aria-hidden="true">
          <span className="ch-pure">PURE.</span>
          <em className="ch-gentle">Gentle</em>
        </span>
      </h1>

      <div className="cloud-bottle" aria-hidden="true">
        <div className="cb-cap" />
        <div className="cb-neck" />
        <div className="cb-body">
          <div className="cb-shine" />
          <div className="cb-label">
            <b>C</b>
            <span>CLASO</span>
            <small>FACE MIST</small>
          </div>
        </div>
      </div>

      <div className="cloud-hero-foot">
        <p className="cloud-hero-sub">
          Curated beauty from the world's most coveted brands. Delivered to your doorstep with love.
        </p>
        <div className="cloud-hero-btns">
          <button className="btn-primary" onClick={() => goToProducts && goToProducts("skincare")}>Shop Skincare</button>
          <button className="cloud-btn-glass" onClick={() => goToProducts && goToProducts("makeup")}>Explore Makeup</button>
        </div>
      </div>

      {(productCount > 0 || brandCount > 0) && (
        <div className="cloud-hero-chips">
          {productCount > 0 && (
            <div className="cloud-chip"><b>{productCount}</b><span>{productCount === 1 ? "Product" : "Products"}</span></div>
          )}
          {brandCount > 0 && (
            <div className="cloud-chip"><b>{brandCount}</b><span>{brandCount === 1 ? "Brand" : "Brands"}</span></div>
          )}
          <div className="cloud-chip"><b>✓</b><span>Authentic</span></div>
        </div>
      )}
    </section>
  );
}
