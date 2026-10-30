// Dreamy cloud hero — "Your skin, glowing ritual" with six brand bottles that
// re-randomize on every page load. Photo: Ernest Brillo / Unsplash. The bottles
// are pure CSS; each brand's look is passed down as CSS variables (--cb-*).
import { useEffect, useState } from "react";

const CLOUD_BG =
  "https://images.unsplash.com/photo-1534271057238-c2c170a76672?auto=format&fit=crop&w=2200&q=80";

// Skincare brand pool — 6 are drawn at random on every load.
const BRAND_POOL = [
  { name: "CeraVe",           product: "Moisturizing Cream", cap: "linear-gradient(90deg,#2f6fb8,#7fb0e8 32%,#d4e6fb 50%,#5c93d6 72%,#1d4e8f)", body: "linear-gradient(90deg,#dfe9f4 0%,#ffffff 30%,#ffffff 46%,#eef4fb 68%,#cfdcec 100%)", ink: "#1c4e9d" },
  { name: "The Ordinary",     product: "Niacinamide 10%",    cap: "linear-gradient(90deg,#141414,#4a4a4a 35%,#8a8a8a 50%,#3a3a3a 72%,#0c0c0c)", body: "linear-gradient(90deg,#b57f2e 0%,#e9be6e 30%,#f7e3b1 46%,#c98f37 68%,#7d5a17 100%)", ink: "#3d2c08" },
  { name: "Beauty of Joseon", product: "Glow Deep Serum",    cap: "linear-gradient(90deg,#2e4434,#5d7a62 32%,#9db8a1 50%,#4c6a52 72%,#22352a)", body: "linear-gradient(90deg,#efe3cb 0%,#fbf4e6 30%,#fffaf0 46%,#ecdfc6 68%,#d4c2a0 100%)", ink: "#3c4a3c" },
  { name: "La Roche-Posay",   product: "Effaclar Serum",     cap: "linear-gradient(90deg,#123c86,#3a6ec0 32%,#9fc0ef 50%,#2d5ea8 72%,#0c2a5e)", body: "linear-gradient(90deg,#e8eef7 0%,#ffffff 30%,#ffffff 46%,#eff4fa 68%,#d4deeb 100%)", ink: "#1a4b8f" },
  { name: "The Inkey List",   product: "Retinol Serum",      cap: "linear-gradient(90deg,#0f0f10,#3a3a3c 32%,#7c7c80 50%,#2c2c2e 72%,#08080a)", body: "linear-gradient(90deg,#ececee 0%,#ffffff 30%,#ffffff 46%,#f2f2f4 68%,#dbdbdf 100%)", ink: "#17171a" },
  { name: "COSRX",            product: "Snail Mucin 96%",    cap: "linear-gradient(90deg,#3c4a3e,#6a7d6e 32%,#aebfae 50%,#576a56 72%,#2c382c)", body: "linear-gradient(90deg,#e9dcc6 0%,#fdf7ea 28%,#fffdf6 46%,#efe3cd 68%,#d6c8a8 100%)", ink: "#4a4232" },
  { name: "Neutrogena",       product: "Hydro Boost",        cap: "linear-gradient(90deg,#c9940e,#f2c22e 32%,#fbe58a 50%,#d9a91c 72%,#96700a)", body: "linear-gradient(90deg,#f4f7fb 0%,#ffffff 32%,#ffffff 46%,#eef4fb 68%,#dde7f2 100%)", ink: "#8a6a08" },
  { name: "Nivea",            product: "Soft Cream",         cap: "linear-gradient(90deg,#0b2f6e,#1d4f9e 32%,#7fa8e0 50%,#17418a 72%,#071f4a)", body: "linear-gradient(90deg,#dde8f8 0%,#f4f9ff 30%,#ffffff 46%,#e3edfa 68%,#c6d6ec 100%)", ink: "#0b3f8f" },
];

// Where the six bottles sit across the hero (percent coordinates).
const SLOTS = [
  { l: 18, t: 46, w: 0.90, r: -9, d: 0   },
  { l: 35, t: 64, w: 0.75, r:  7, d: 0.8 },
  { l: 50, t: 36, w: 1.05, r: -3, d: 0.4 },
  { l: 65, t: 62, w: 0.80, r:  8, d: 1.6 },
  { l: 79, t: 44, w: 0.95, r: -7, d: 1.1 },
  { l: 30, t: 26, w: 0.70, r:  6, d: 2.0 },
];

// Floating trust cards that orbit the headline.
const FLOATS = [
  { big: "15K+",  label: "Orders",   sub: "★★★★★" },
  { big: "4.7",   label: "Rating",   sub: "★★★★☆" },
  { big: "100+",  label: "Reviews",  sub: "✓ Verified" },
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

// Shuffle the brand pool and take 6, so every page load looks different.
function pickBottles() {
  const pool = [...BRAND_POOL];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, SLOTS.length).map((brand, i) => ({ ...brand, ...SLOTS[i], id: brand.name }));
}

export default function CloudHero({ goToProducts }) {
  // Set on the client only, so SSR markup and hydration always agree.
  const [bottles, setBottles] = useState([]);
  useEffect(() => { setBottles(pickBottles()); }, []);

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

      {bottles.map((b) => (
        <div
          key={b.id}
          className="cloud-bottle"
          aria-hidden="true"
          style={{
            left: `${b.l}%`, top: `${b.t}%`,
            animationDelay: `${b.d}s`,
            "--bw": b.w,
            "--br": `${b.r}deg`,
            "--cb-cap": b.cap,
            "--cb-body": b.body,
            "--cb-ink": b.ink,
          }}
        >
          <div className="cb-cap" />
          <div className="cb-neck" />
          <div className="cb-body">
            <div className="cb-shine" />
            <div className="cb-label">
              <b>{b.name.charAt(0)}</b>
              <span>{b.name}</span>
              <small>{b.product}</small>
            </div>
          </div>
        </div>
      ))}

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
