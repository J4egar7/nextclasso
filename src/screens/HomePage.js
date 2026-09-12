import { Fragment, useState, useEffect, useRef } from "react";
import { bestsellerProducts } from "../data/products.js";
import { reviews } from "../data/reviews.js";

/* ============================================================
   SHARED: Before/After comparison slider
   ============================================================ */
function BeforeAfterSlider({ product, onInteract }) {
  const [pos, setPos] = useState(50);
  const trackRef = useRef(null);
  const dragging = useRef(false);

  const updateFromClientX = (clientX) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    let pct = ((clientX - rect.left) / rect.width) * 100;
    pct = Math.max(0, Math.min(100, pct));
    setPos(pct);
  };

  const onDown = (e) => {
    onInteract && onInteract();
    dragging.current = true;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    updateFromClientX(x);
  };
  const onMove = (e) => {
    if (!dragging.current) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    updateFromClientX(x);
  };
  const onUp = () => { dragging.current = false; };

  return (
    <div
      className="ba-slider"
      ref={trackRef}
      onMouseDown={onDown}
      onMouseMove={onMove}
      onMouseUp={onUp}
      onMouseLeave={onUp}
      onTouchStart={onDown}
      onTouchMove={onMove}
      onTouchEnd={onUp}
    >
      <div className="ba-layer ba-after" style={{ background: product.bg }}>
        <span className="ba-emoji">{product.emoji}</span>
      </div>
      <div className="ba-layer ba-before" style={{ background: product.bg, clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <span className="ba-emoji">{product.emoji}</span>
      </div>
      <div className="ba-divider" style={{ left: `${pos}%` }}>
        <div className="ba-handle-grip">↔</div>
      </div>
      <div className="ba-tag ba-tag-before">Before</div>
      <div className="ba-tag ba-tag-after">After</div>
    </div>
  );
}

/* ============================================================
   SHARED: "See it on skin" panel — used by both desktop + mobile
   ============================================================ */
function SkinPanel({ product, galleryTab, setGalleryTab, onInteract, onSwipeProduct, isMobile }) {
  const touchX = useRef(0);
  const [swipeDir, setSwipeDir] = useState(0);
  const animKey = useRef(0);
  if (!product) return null;
  const tabs = ["On Skin", "Texture", "Before / After"];

  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX; onInteract && onInteract(); };
  const onTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 30 && onSwipeProduct) {
      const dir = dx < 0 ? 1 : -1;
      setSwipeDir(dir);
      animKey.current += 1;
      onSwipeProduct(dir);
    }
  };

  return (
    <div
      className={isMobile ? "mb-facepanel" : "dt-facepanel"}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="face-panel-label">See it on skin ✦ {product.name}</div>
      <div className={isMobile ? "mb-facepanel-main" : "dt-facepanel-main"}>
        <div key={animKey.current} className={`mb-swipe-anim ${swipeDir === 1 ? "from-right" : swipeDir === -1 ? "from-left" : ""}`}>
          {galleryTab === 0 && (
            <div className="mb-skin-tile" style={{ background: product.bg }}>
              <span style={{ fontSize: isMobile ? "64px" : "96px" }}>{product.emoji}</span>
              <div className="face-panel-overlay-tag">{product.name}</div>
            </div>
          )}
          {galleryTab === 1 && (
            <div className="mb-skin-tile mb-texture-tile" style={{ background: product.bg }}>
              <div className="mb-texture-swatch" />
              <div className="face-panel-overlay-tag">Texture close-up</div>
            </div>
          )}
          {galleryTab === 2 && <BeforeAfterSlider product={product} onInteract={onInteract} />}
        </div>
        {isMobile && <div className="mb-swipe-hint">‹ swipe ›</div>}
      </div>
      <div className={isMobile ? "mb-facepanel-thumbs" : "dt-facepanel-thumbs"}>
        {tabs.map((t, i) => (
          <button
            key={t}
            className={`mb-gallery-tab ${galleryTab === i ? "active" : ""}`}
            onClick={() => { onInteract && onInteract(); setGalleryTab(i); }}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}

const PRODUCT_DISPLAY_MS = 1800;
const PROGRESS_TICK_MS   = 60;

/* ============================================================
   DESKTOP: 4-up carousel with sticky skin panel on the right
   ============================================================ */
function DesktopBestsellers({ addToCart, toggleFavourite, isFav, openProduct, startPage = 0 }) {
  const CARDS_PER_PAGE = 4;
  const totalPages = Math.ceil(bestsellerProducts.length / CARDS_PER_PAGE);

  const [pageIndex,    setPageIndex]    = useState(Math.min(startPage, Math.max(0, totalPages - 1)));
  const [subPairIndex, setSubPairIndex] = useState(0); // 0 = cards [0,1] shown in the panels, 1 = cards [2,3]
  const [galleryTabA,  setGalleryTabA]  = useState(0);
  const [galleryTabB,  setGalleryTabB]  = useState(0);
  const [isPaused,     setIsPaused]     = useState(false);
  const [progress,     setProgress]     = useState(0);
  const resumeTimeout = useRef(null);

  const pauseAuto = () => {
    setIsPaused(true);
    if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
    resumeTimeout.current = setTimeout(() => setIsPaused(false), 6000);
  };
  useEffect(() => () => { if (resumeTimeout.current) clearTimeout(resumeTimeout.current); }, []);

  // Auto-advance: show the first pair of 2, then the second pair of 2,
  // then move to the next page of 4 and start over.
  useEffect(() => {
    if (isPaused) return;
    setProgress(0);
    const startedAt = Date.now();
    const id = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const pct = Math.min(1, elapsed / PRODUCT_DISPLAY_MS);
      setProgress(pct);
      if (pct >= 1) {
        clearInterval(id);
        if (subPairIndex === 0) {
          setSubPairIndex(1);
        } else {
          setSubPairIndex(0);
          setPageIndex(i => (i + 1) % totalPages);
        }
      }
    }, PROGRESS_TICK_MS);
    return () => clearInterval(id);
  }, [isPaused, subPairIndex, pageIndex, totalPages]);

  useEffect(() => { setGalleryTabA(0); setGalleryTabB(0); }, [pageIndex, subPairIndex]);

  const goToPage = (i) => { pauseAuto(); setPageIndex(i); setSubPairIndex(0); };
  const goPrev = () => { pauseAuto(); setPageIndex(i => (i - 1 + totalPages) % totalPages); setSubPairIndex(0); };
  const goNext = () => { pauseAuto(); setPageIndex(i => (i + 1) % totalPages); setSubPairIndex(0); };

  const ringPct = isPaused ? 0 : Math.round(progress * 100);
  const pageProducts = bestsellerProducts.slice(pageIndex * CARDS_PER_PAGE, pageIndex * CARDS_PER_PAGE + CARDS_PER_PAGE);
  const panelProductA = pageProducts[subPairIndex * 2]     || pageProducts[0];
  const panelProductB = pageProducts[subPairIndex * 2 + 1] || pageProducts[1];

  return (
    <div className="dt-bestsellers">
      {/* LEFT: carousel cards */}
      <div className="dt-carousel-col">
        <div className="dt-carousel-nav">
          <button className="dt-carousel-arrow" onClick={goPrev} aria-label="Previous products">‹</button>
          <div className="dt-carousel-track">
            <div className="dt-cards-grid">
              {pageProducts.map((p, idx) => {
                const isActive = Math.floor(idx / 2) === subPairIndex;
                return (
                  <div key={p.id} className="dt-card-wrap">
                    {/* Progress ring indicator */}
                    <button
                      className={`mb-display-indicator ${isActive ? "active" : ""}`}
                      style={isActive ? { "--ring-pct": `${ringPct}%` } : undefined}
                      onClick={(e) => { e.stopPropagation(); pauseAuto(); setSubPairIndex(Math.floor(idx / 2)); }}
                      aria-label={`Preview ${p.name}`}
                    >
                      <span className="mb-display-indicator-dot">{isActive ? "👁" : "○"}</span>
                    </button>
                    <div
                      className={`dt-card ${isActive ? "dt-card-active" : ""}`}
                      onClick={() => { pauseAuto(); openProduct({ ...p, _prevPage: "home" }); }}
                    >
                      <div className="dt-card-img" style={{ background: p.bg }}>
                        <span style={{ fontSize: "52px" }}>{p.emoji}</span>
                        {p.badge && <div className={`product-badge ${p.badge === "new" ? "new" : ""}`}>{p.badge}</div>}
                        <button
                          className="product-wish-btn"
                          onClick={e => { e.stopPropagation(); pauseAuto(); toggleFavourite(p); }}
                        >
                          {isFav(p.id) ? "❤️" : "🤍"}
                        </button>
                      </div>
                      <div className="dt-card-info">
                        <div className="dt-card-brand">{p.brand}</div>
                        <div className="dt-card-name">{p.name}</div>
                        <div className="dt-card-rating">
                          <span className="stars">{"★".repeat(Math.floor(p.rating))}</span>
                          <span className="rating-count">({p.reviews})</span>
                        </div>
                        <div className="dt-card-footer">
                          <span className="dt-card-price">{p.price}</span>
                          <button
                            className="add-btn"
                            onClick={e => { e.stopPropagation(); pauseAuto(); addToCart(p); }}
                          >+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <button className="dt-carousel-arrow" onClick={goNext} aria-label="Next products">›</button>
        </div>

        {/* Page dots */}
        <div className="mb-dots dt-dots">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button key={i} className={`mb-dot ${i === pageIndex ? "active" : ""}`} onClick={() => goToPage(i)} />
          ))}
        </div>
      </div>

      {/* RIGHT: two "See it on skin" panels side by side, showing the current pair */}
      <div className="dt-panel-col">
        <div className="dt-skinpanel-duo">
          <SkinPanel
            product={panelProductA}
            galleryTab={galleryTabA}
            setGalleryTab={setGalleryTabA}
            onInteract={pauseAuto}
            isMobile={false}
          />
          <SkinPanel
            product={panelProductB}
            galleryTab={galleryTabB}
            setGalleryTab={setGalleryTabB}
            onInteract={pauseAuto}
            isMobile={false}
          />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MOBILE: 2-up carousel (original, untouched)
   ============================================================ */
function MobileBestsellers({ addToCart, toggleFavourite, isFav, openProduct }) {
  const [pairIndex,   setPairIndex]   = useState(0);
  const [subIndex,    setSubIndex]    = useState(0);
  const [galleryTab,  setGalleryTab]  = useState(0);
  const [isPaused,    setIsPaused]    = useState(false);
  const [progress,    setProgress]    = useState(0);
  const totalPairs = Math.ceil(bestsellerProducts.length / 2);
  const touchX = useRef(0);
  const resumeTimeout = useRef(null);

  const pauseAuto = () => {
    setIsPaused(true);
    if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
    resumeTimeout.current = setTimeout(() => setIsPaused(false), 6000);
  };
  useEffect(() => () => { if (resumeTimeout.current) clearTimeout(resumeTimeout.current); }, []);

  useEffect(() => {
    if (isPaused) return;
    setProgress(0);
    const startedAt = Date.now();
    const id = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const pct = Math.min(1, elapsed / PRODUCT_DISPLAY_MS);
      setProgress(pct);
      if (pct >= 1) {
        clearInterval(id);
        if (subIndex === 0) {
          setSubIndex(1);
        } else {
          setSubIndex(0);
          setPairIndex(i => (i + 1) % totalPairs);
        }
      }
    }, PROGRESS_TICK_MS);
    return () => clearInterval(id);
  }, [isPaused, subIndex, pairIndex, totalPairs]);

  useEffect(() => { setGalleryTab(0); }, [pairIndex]);

  const goTo = (i) => { pauseAuto(); setPairIndex(((i % totalPairs) + totalPairs) % totalPairs); setSubIndex(0); };

  const onTrackTouchStart = (e) => { touchX.current = e.touches[0].clientX; pauseAuto(); };
  const onTrackTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) {
      pauseAuto();
      setSubIndex(0);
      setPairIndex(i => {
        const next = dx < 0 ? i + 1 : i - 1;
        return ((next % totalPairs) + totalPairs) % totalPairs;
      });
    }
  };

  const onSwipeProduct = (dir) => {
    pauseAuto();
    setSubIndex(s => {
      const next = s + dir;
      if (next > 1) {
        // swiped past the last product on this page — advance to the next page
        setPairIndex(i => (i + 1) % totalPairs);
        return 0;
      }
      if (next < 0) {
        // swiped back past the first product — go to the previous page's last product
        setPairIndex(i => ((i - 1) % totalPairs + totalPairs) % totalPairs);
        return 1;
      }
      return next;
    });
  };
  const showProduct = (page, idx) => { pauseAuto(); setPairIndex(page); setSubIndex(idx); };

  const activeProduct = bestsellerProducts[pairIndex * 2 + subIndex] || bestsellerProducts[pairIndex * 2];
  const ringPct = isPaused ? 0 : Math.round(progress * 100);

  return (
    <div className="mobile-bestsellers">
      <div className="mb-track-wrap" onTouchStart={onTrackTouchStart} onTouchEnd={onTrackTouchEnd}>
        <div className="mb-track" style={{ transform: `translateX(-${pairIndex * 100}%)` }}>
          {Array.from({ length: totalPairs }).map((_, page) => (
            <div className="mb-page" key={page}>
              {bestsellerProducts.slice(page * 2, page * 2 + 2).map((p, idx) => {
                const isActive = pairIndex === page && subIndex === idx;
                return (
                  <div key={p.id} className="mb-card-wrap">
                    <button
                      className={`mb-display-indicator ${isActive ? "active" : ""}`}
                      style={isActive ? { "--ring-pct": `${ringPct}%` } : undefined}
                      onClick={(e) => { e.stopPropagation(); showProduct(page, idx); }}
                      aria-label={`Show ${p.name}`}
                    >
                      <span className="mb-display-indicator-dot">{isActive ? "👁" : "○"}</span>
                    </button>
                    <div className="mb-card" onClick={() => { pauseAuto(); openProduct({ ...p, _prevPage: "home" }); }}>
                      <div className="mb-card-img" style={{ background: p.bg }}>
                        <span style={{ fontSize: "40px" }}>{p.emoji}</span>
                        <button className="product-wish-btn" onClick={e => { e.stopPropagation(); pauseAuto(); toggleFavourite(p); }}>{isFav(p.id) ? "❤️" : "🤍"}</button>
                      </div>
                      <div className="mb-card-info">
                        <div className="mb-card-brand">{p.brand}</div>
                        <div className="mb-card-name">{p.name}</div>
                        <div className="mb-card-footer">
                          <span className="mb-card-price">{p.price}</span>
                          <button className="add-btn" onClick={e => { e.stopPropagation(); pauseAuto(); addToCart(p); }}>+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="mb-dots">
        {Array.from({ length: totalPairs }).map((_, i) => (
          <button key={i} className={`mb-dot ${i === pairIndex ? "active" : ""}`} onClick={() => goTo(i)} />
        ))}
      </div>
      <SkinPanel
        product={activeProduct}
        galleryTab={galleryTab}
        setGalleryTab={setGalleryTab}
        onInteract={pauseAuto}
        onSwipeProduct={onSwipeProduct}
        isMobile={true}
      />
    </div>
  );
}

/* ============================================================
   PAGE
   ============================================================ */
function HomePage({ setPage, goToProducts, addToCart, toggleFavourite, isFav, openProduct }) {
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
      <section className="home-hero" style={{
        backgroundImage: "url('/hero-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center right",
        backgroundRepeat: "no-repeat",
      }}>
        <div className="hero-wash" />
        <div className="hero-spotlight" />
        <div className="hero-blob-3" style={{opacity:0.4}} />
        <div className="hero-content">
          <div className="hero-tag">New Arrivals ✦ Spring 2026</div>
          <h1 className="hero-title">
            Your skin,<br />
            <span className="accent">glowing</span><br />
            <span className="accent2">ritual</span>
          </h1>
          <p className="hero-sub">Curated beauty from the world's most coveted brands. Delivered to your doorstep with love.</p>
          <div className="hero-btns">
            <button className="btn-primary" onClick={() => goToProducts("skincare")}>Shop Skincare</button>
            <button className="btn-outline" onClick={() => goToProducts("makeup")}>Explore Makeup</button>
          </div>
        </div>
        <div className="hero-card-anchor" style={{ left: "60%", top: "23.5%" }}>
          <div className="hero-card-sm c3">
            <div style={{fontSize:"11px",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",color:"rgba(0,0,0,0.35)",marginBottom:"4px"}}>Launch Offer</div>
            <div className="num" style={{fontSize:"22px"}}>50% OFF</div>
            <div style={{fontSize:"11px",color:"rgba(0,0,0,0.4)",fontWeight:500}}>This month only 🎉</div>
          </div>
        </div>
        <div className="hero-card-anchor" style={{ left: "90.3%", top: "19.7%" }}>
          <div className="hero-card-sm c2">
            <div className="num">2.3K+</div>
            <div style={{fontSize:'11px',color:'rgba(0,0,0,0.4)',fontWeight:600,letterSpacing:'1px',textTransform:'uppercase',marginTop:'2px'}}>Verified Reviews</div>
            <div className="hero-stars">⭐ Trusted</div>
          </div>
        </div>
        <div className="hero-card-anchor" style={{ left: "67.5%", top: "65.5%" }}>
          <div className="hero-card-sm c1">
            <div className="num">15K+</div>
            <div style={{fontSize:'11px',color:'rgba(0,0,0,0.4)',fontWeight:600,letterSpacing:'1px',textTransform:'uppercase',marginTop:'2px'}}>Happy Customers</div>
            <div className="hero-stars">★★★★★</div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee-wrap">
        <div className="marquee-track">
          {[...Array(2)].map((_,i) => (
            ["FREE SHIPPING OVER PKR 5000","OVER 15,000 HAPPY CUSTOMERS","AUTHENTIC PRODUCTS GUARANTEED","2,300+ FIVE STAR REVIEWS","K-BEAUTY EXPERTS","SAME DAY DISPATCH"].map((t,j) => (
              <div key={`${i}-${j}`} className="marquee-item">{t}</div>
            ))
          ))}
        </div>
      </div>

      {/* STATS */}
      <div className="stats-band">
        {[
          { num:"15,000+", label:"Happy Customers" },
          { num:"2,300+",  label:"5-Star Reviews"  },
          { num:"200+",    label:"Premium Brands"   },
          { num:"24/7",    label:"Customer Support" },
        ].map((s, i) => (
          <Fragment key={s.label}>
            <div className="stat-item">
              <div className="stat-num">{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
            {i < 3 && <div className="stat-divider" />}
          </Fragment>
        ))}
      </div>

      {/* BESTSELLERS — desktop carousel + mobile carousel, CSS controls which shows */}
      <section className="section section-home">
        <div className="section-header">
          <div>
            <div className="section-eyebrow">✦ Hand-Picked For You</div>
            <h2 className="section-title">Bestselling <em>favourites</em></h2>
          </div>
        </div>

        {/* Desktop: 4-up interactive carousel */}
        <DesktopBestsellers
          addToCart={addToCart}
          toggleFavourite={toggleFavourite}
          isFav={isFav}
          openProduct={openProduct}
        />

        {/* Mobile: 2-up swipeable carousel */}
        <MobileBestsellers
          addToCart={addToCart}
          toggleFavourite={toggleFavourite}
          isFav={isFav}
          openProduct={openProduct}
        />
      </section>

      {/* BANNER SPLIT */}
      <div className="banner-split">
        <div className="banner-half coral" onClick={() => goToProducts("skincare")}>
          <div className="banner-half-title">Your skin<br />deserves<br />the best</div>
          <div className="banner-half-sub">Serums, moisturisers & actives<br />from global cult brands</div>
          <div className="banner-link">Shop Skincare <span className="banner-arrow">→</span></div>
          <div className="banner-emoji">🌸</div>
        </div>
        <div className="banner-half teal" onClick={() => goToProducts("makeup")}>
          <div className="banner-half-title">Make up,<br />show up,<br />glow up</div>
          <div className="banner-half-sub">Lipsticks, foundations & palettes<br />that make you unstoppable</div>
          <div className="banner-link">Shop Makeup <span className="banner-arrow">→</span></div>
          <div className="banner-emoji">💄</div>
        </div>
      </div>

      {/* PARALLAX TEXT BAND */}
      <div className="parallax-text-section" style={{ position: "relative" }}>
        <div className="parallax-text">
          {[...Array(2)].map((_,i) =>
            ["GLOW ✦ RADIANCE ✦ BEAUTY ✦ LUXE ✦ SKIN ✦ LOVE ✦ RITUAL ✦ GLOW ✦ RADIANCE ✦ BEAUTY ✦ LUXE ✦ SKIN ✦ LOVE ✦ RITUAL ✦"].map((t,j) =>
              <span key={`${i}-${j}`}>{t}</span>
            )
          )}
        </div>
        <div className="parallax-text-overlay">"Beauty is the art of living well."</div>
      </div>

      {/* REVIEWS */}
      <section className="reviews-section">
        <div className="reviews-header">
          <div className="reviews-eyebrow">✦ Real People, Real Results</div>
          <h2 className="reviews-title">Over 2,300 customers <br/>absolutely <em>love</em> us</h2>
        </div>
        <div className="reviews-track-outer">
          <div className="reviews-track">
            {[...reviews, ...reviews].map((r, i) => (
              <div key={i} className="review-card">
                <div className="review-stars">{"★".repeat(r.rating)}</div>
                <p className="review-text">"{r.text}"</p>
                <div className="review-author">
                  <div className="review-avatar" style={{background:'rgba(255,255,255,0.1)'}}>{r.avatar}</div>
                  <div>
                    <div className="review-name">{r.name}</div>
                    <div className="review-product">{r.product}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RITUAL SECTION */}
      <section className="ritual-section">
        <div className="ritual-grid">
          <div>
            <div className="ritual-eyebrow">✦ Our Philosophy</div>
            <h2 className="ritual-title">Beauty<br />as a daily<br />ritual</h2>
            <p className="ritual-body">
              We believe skincare is self-care. Every product we carry is chosen with intention — from ingredients that nourish to formulas that transform.
            </p>
            <button className="btn-primary" onClick={() => setPage("about")}>Our Story</button>
          </div>
          <div className="ritual-steps">
            {[
              { n:"01", e:"🌙", t:"Cleanse — Start fresh"      },
              { n:"02", e:"💧", t:"Hydrate — Lock in moisture"  },
              { n:"03", e:"✨", t:"Treat — Target concerns"     },
              { n:"04", e:"🛡️", t:"Protect — SPF always"        },
            ].map(s => (
              <div key={s.n} className="ritual-step">
                <span className="step-num">{s.n}</span>
                <span className="step-emoji">{s.e}</span>
                <span className="step-text">{s.t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="newsletter">
        <div className="newsletter-title">Join the glow family 💛</div>
        <p className="newsletter-sub">Get 15% off your first order + early access to launches & sales</p>
        <div className="newsletter-form">
          <input className="newsletter-input" placeholder="your@email.com" />
          <button className="newsletter-btn">Subscribe</button>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
