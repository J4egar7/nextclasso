// Dreamy cloud hero — "Your skin, glowing ritual" with a real product bottle
// that is picked at random from a pool of famous skincare brands on every page
// load (CeraVe, The Ordinary, Beauty of Joseon, COSRX, The Inkey List).
// Background photo: Ernest Brillo / Unsplash. Bottle packshots live in /public/bottles.
import { useEffect, useState } from "react";

const CLOUD_BG =
  "https://images.unsplash.com/photo-1534271057238-c2c170a76672?auto=format&fit=crop&w=2200&q=80";

// One of these is chosen at random on every page load. Images are transparent
// packshot PNGs downloaded from official-brand sources (see /public/bottles).
const BOTTLE_POOL = [
  { id: "cerave",   name: "CeraVe Moisturising Cream",      src: "/bottles/cerave.png" },
  { id: "ordinary", name: "The Ordinary Multi-Peptide Serum", src: "/bottles/the-ordinary.png" },
  { id: "inkey",    name: "The Inkey List Hyaluronic Serum",  src: "/bottles/the-inkey-list.png" },
  { id: "cosrx",    name: "COSRX Snail 96 Mucin Essence",     src: "/bottles/cosrx.png" },
  { id: "boj",      name: "Beauty of Joseon Glow Serum",      src: "/bottles/beauty-of-joseon.png" },
];

// Floating trust cards that hug the headline.
const FLOATS = [
  { big: "15K+",  label: "Orders",    sub: "★★★★★" },
  { big: "4.7",   label: "Rating",    sub: "★★★★☆" },
  { big: "100+",  label: "Reviews",   sub: "✓ Verified" },
  { big: "2.3K+", label: "Customers", sub: "★ Trusted" },
];

const BUBBLES = [
  { l: "14%", t: "16%", s: 74, d: 0 },
  { l: "80%", t: "14%", s: 58, d: 1.2 },
  { l: "7%",  t: "58%", s: 38, d: 2.1 },
  { l: "88%", t: "54%", s: 30, d: 0.6 },
  { l: "30%", t: "70%", s: 54, d: 1.7 },
  { l: "64%", t: "72%", s: 42, d: 2.6 },
];

export default function CloudHero({ goToProducts }) {
  // Chosen client-side only, so SSR markup and hydration always agree.
  const [bottle, setBottle] = useState(null);
  useEffect(() => {
    setBottle(BOTTLE_POOL[Math.floor(Math.random() * BOTTLE_POOL.length)]);
  }, []);

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

      <h1 className="cloud-hero-title" aria-label="Your skin, glowing ritual">
        <span className="ch-line ch-skin" aria-hidden="true">Your skin,</span>
        <em className="ch-line ch-glowing" aria-hidden="true">glowing</em>
        <span className="ch-line ch-ritual" aria-hidden="true">ritual</span>
      </h1>

      {bottle && (
        <div className="cloud-bottle" aria-hidden="true">
          <img src={bottle.src} alt="" width={340} height={340} />
        </div>
      )}

      {FLOATS.map((f, i) => (
        <div
          key={i}
          className={`ch-float ch-f${i + 1}`}
          aria-hidden="true"
          style={{ animationDelay: `${i * 0.9}s` }}
        >
          <b>{f.big}</b>
          <span>{f.label}</span>
          <small>{f.sub}</small>
        </div>
      ))}

      <div className="cloud-hero-foot">
        <p className="cloud-hero-sub">
          Curated beauty from the world's most coveted brands. Delivered to your doorstep with love.
        </p>
        <div className="cloud-hero-btns">
          <button className="btn-primary" onClick={() => goToProducts && goToProducts("skincare")}>Shop Skincare</button>
          <button className="cloud-btn-glass" onClick={() => goToProducts && goToProducts("makeup")}>Explore Makeup</button>
        </div>
      </div>
    </section>
  );
}
