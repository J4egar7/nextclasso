import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase.js";
import { pageToPath } from "../lib/routes.js";
import { SKINCARE_CATEGORIES, MAKEUP_CATEGORIES } from "../data/constants.js";

// Which browse page a product belongs on (used for the back link, the
// breadcrumb and the page's colour theme).
const pageForCategory = (category) =>
  MAKEUP_CATEGORIES.includes(category) ? "makeup"
  : category === "Fragrance" ? "fragrances"
  : category === "Hair & Body" ? "hair-care"
  : "skincare";

function StarRating({ value = 5, size = 16, color = "#C9A96E" }) {
  // Renders partial-fill stars (e.g. 4.6) instead of rounding down to whole stars
  const stars = [0, 1, 2, 3, 4].map(i => Math.max(0, Math.min(1, value - i)));
  return (
    <span style={{ display: "inline-flex", lineHeight: 1 }}>
      {stars.map((fill, i) => (
        <span key={i} style={{ position: "relative", display: "inline-block", fontSize: size, width: size * 1.05 }}>
          <span style={{ color: "rgba(42,28,12,0.15)" }}>★</span>
          <span style={{ position: "absolute", left: 0, top: 0, width: `${fill * 100}%`, overflow: "hidden", color }}>★</span>
        </span>
      ))}
    </span>
  );
}

function ProductDetailPage({ product: p, setPage, addToCart, toggleFavourite, isFav, prevPage: fromPage, openProduct, products }) {
  const [qty, setQty] = useState(1);
  const [activeThumb, setActiveThumb] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);
  const [reviewSort, setReviewSort] = useState("recent");
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [form, setForm] = useState({ name: "", city: "", title: "", body: "", stars: 0 });
  const [hoverStars, setHoverStars] = useState(0);
  const [reviewState, setReviewState] = useState("idle"); // idle | sending | sent
  const [reviewError, setReviewError] = useState("");

  // Real, approved customer reviews for this product, straight from the database.
  useEffect(() => {
    let cancelled = false;
    setReviewsLoaded(false);
    supabase
      .from("reviews")
      .select("id, reviewer_name, city, rating, title, body, created_at")
      .eq("product_id", p.id)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        setReviews(error ? [] : (data || []));
        setReviewsLoaded(true);
      });
    return () => { cancelled = true; };
  }, [p.id]);

  const submitReview = async () => {
    setReviewError("");
    setReviewState("sending");
    const { error } = await supabase.rpc("submit_review", {
      p_product_id: String(p.id),
      p_name: form.name,
      p_rating: form.stars,
      p_title: form.title,
      p_body: form.body,
      p_city: form.city,
    });
    if (error) {
      const known = /please|rating|too many reviews/i.test(error.message || "");
      setReviewError(known ? error.message : "We couldn't send your review. Please try again in a moment.");
      setReviewState("idle");
      return;
    }
    setForm({ name: "", city: "", title: "", body: "", stars: 0 });
    setReviewState("sent");
  };

  const isMakeup = MAKEUP_CATEGORIES.includes(p.category);
  const prevPage = (fromPage === "home" || fromPage === "search") ? fromPage : pageForCategory(p.category);
  const backLabel = ({ makeup: "Makeup", home: "Home", search: "Search", fragrances: "Fragrances", "hair-care": "Hair Care", skincare: "Skincare" })[prevPage] || "Skincare";

  const stock = Number.isFinite(p.stock) ? p.stock : Infinity;
  const soldOut = stock <= 0;
  const lowStock = !soldOut && stock <= 5;

  const primaryColor = isMakeup ? "var(--make-primary)" : "var(--skin-primary)";
  const addBtnBg     = isMakeup
    ? "linear-gradient(135deg,var(--make-primary),#FF6BC8)"
    : "linear-gradient(135deg,var(--skin-primary),var(--skin-secondary))";
  const shadowColor  = isMakeup ? "rgba(233,30,140,0.3)" : "rgba(201,116,143,0.3)";

  const priceNum = parseInt((p.price||"").replace(/[^0-9]/g,""))||0;

  const thumbSlots = (p.images && p.images.length > 0)
    ? p.images.map(url => ({ image: url, bg: p.bg || "linear-gradient(135deg,#F5EDD8,#EDD9B4)" }))
    : [{ emoji: p.emoji, bg: p.bg || "linear-gradient(135deg,#F5EDD8,#EDD9B4)" }];

  // "Related products" pool: other products from the same part of the store,
  // drawn from the live catalogue.
  const sameSection = (x) => pageForCategory(x.category) === pageForCategory(p.category);
  const pool = (products || []).filter(x => x.id !== p.id && sameSection(x));
  const related = pool.filter(x => x.category === p.category).slice(0,4);
  const relatedFallback = related.length ? related : pool.slice(0,4);

  const fmt = n => "PKR " + n.toLocaleString("en-PK");

  const hasRealRating = p.reviews > 0 && p.rating > 0;
  const sortedReviews = [...reviews].sort((a, b) => {
    if (reviewSort === "highest") return b.rating - a.rating;
    if (reviewSort === "lowest") return a.rating - b.rating;
    return new Date(b.created_at) - new Date(a.created_at);
  });
  const visibleReviews = showAllReviews ? sortedReviews : sortedReviews.slice(0, 4);
  const fmtReviewDate = d => d ? new Date(d).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "";

  return (
    <div className="pdp-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: p.name,
            brand: { "@type": "Brand", name: p.brand },
            description: p.desc || `${p.brand} ${p.name}, available on CLASO.`,
            image: p.images && p.images.length ? p.images : undefined,
            sku: String(p.id),
            category: p.category,
            aggregateRating: hasRealRating ? {
              "@type": "AggregateRating",
              ratingValue: p.rating,
              reviewCount: p.reviews,
            } : undefined,
            offers: {
              "@type": "Offer",
              priceCurrency: "PKR",
              price: p.priceNum || priceNum,
              availability: soldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
              itemCondition: "https://schema.org/NewCondition",
            },
          }).replace(/</g, "\\u003c"),
        }}
      />
      <nav className="pdp-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link> /{" "}
        <Link href={pageToPath(prevPage)}>{backLabel}</Link> /{" "}
        <span className="pdp-breadcrumb-current">{p.name}</span>
      </nav>
      <button className="pdp-back" onClick={() => setPage(prevPage)}>
        ← Back to {backLabel}
      </button>

      <div className="pdp-hero">
        {/* LEFT — Images */}
        <div className="pdp-image-area">
          <div className="pdp-main-img" style={{ background: thumbSlots[activeThumb].bg, "--accent": p.accent }}>
            {thumbSlots[activeThumb].image
              ? <img src={thumbSlots[activeThumb].image} alt={p.name} style={{ width:"100%", height:"100%", objectFit:"contain" }} />
              : <span>{thumbSlots[activeThumb].emoji}</span>}
            {p.badge && (
              <div className="pdp-badge" style={{ position:"absolute", top:"20px", left:"20px", background: isMakeup ? "var(--make-primary)" : "var(--skin-primary)", color:"white" }}>
                {p.badge}
              </div>
            )}
          </div>
          <div className="pdp-img-thumbs">
            {thumbSlots.map((t, i) => (
              <div key={i}
                className={"pdp-thumb" + (activeThumb===i ? " active" : "")}
                style={{ background: t.bg }}
                onClick={() => setActiveThumb(i)}>
                {t.image
                  ? <img src={t.image} alt="" style={{ width:"100%", height:"100%", objectFit:"contain" }} />
                  : t.emoji}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Info */}
        <div className="pdp-info">
          <div className="pdp-badge-row">
            {p.badge && <span className="pdp-badge" style={{ background: isMakeup?"rgba(233,30,140,0.1)":"rgba(201,116,143,0.1)", color:primaryColor, border:`1px solid ${isMakeup?"rgba(233,30,140,0.25)":"rgba(201,116,143,0.25)"}` }}>{p.badge}</span>}
            <span className="pdp-badge" style={{ background:"rgba(93,138,94,0.1)", color:"#3d7a3e", border:"1px solid rgba(93,138,94,0.25)" }}>✓ 100% Authentic</span>
            {p.category && <span className="pdp-badge" style={{ background:"rgba(141,110,99,0.08)", color:"rgba(42,28,12,0.45)", border:"1px solid rgba(141,110,99,0.15)" }}>{p.category}</span>}
          </div>

          <div className="pdp-brand" style={{ color: primaryColor }}>{p.brand}</div>
          <h1 className="pdp-name">{p.name}</h1>

          <div className="pdp-rating-row">
            {hasRealRating ? (
              <>
                <StarRating value={p.rating} size={17} />
                <span className="pdp-rating-val">{p.rating}</span>
                <span className="pdp-review-count">({p.reviews.toLocaleString()} {p.reviews === 1 ? "review" : "reviews"})</span>
              </>
            ) : (
              <span className="pdp-review-count">No reviews yet</span>
            )}
          </div>

          {soldOut && <div className="pdp-stock-note soldout">Sold out</div>}
          {lowStock && <div className="pdp-stock-note low">Only {stock} left</div>}

          <div style={{ marginBottom:"4px", display:"flex", alignItems:"center", gap:"10px", flexWrap:"wrap" }}>
            <span className="pdp-price" style={{ color:primaryColor }}>{p.price}</span>
          </div>
          <div className="pdp-delivery-note">
            🚚 {priceNum*qty >= 5000 ? "Free delivery included" : `Add ${fmt(5000-priceNum*qty)} more for free delivery`}
          </div>

          <div className="pdp-divider" />
          <p className="pdp-desc">{p.desc || "A carefully selected formula from a trusted brand, sourced and sold by CLASO."}</p>

          {(p.purchases > 0 || hasRealRating) && (
            <div className="pdp-stats-grid">
              {hasRealRating && (
                <div className="pdp-stat">
                  <div className="pdp-stat-icon">⭐</div>
                  <div className="pdp-stat-val" style={{ color:primaryColor }}>{p.rating}</div>
                  <div className="pdp-stat-label">Rating</div>
                </div>
              )}
              {p.purchases > 0 && (
                <div className="pdp-stat">
                  <div className="pdp-stat-icon">🛍️</div>
                  <div className="pdp-stat-val">{p.purchases >= 1000 ? `${(p.purchases/1000).toFixed(1)}k` : p.purchases}</div>
                  <div className="pdp-stat-label">Sold</div>
                </div>
              )}
              {hasRealRating && (
                <div className="pdp-stat">
                  <div className="pdp-stat-icon">💬</div>
                  <div className="pdp-stat-val">{p.reviews >= 1000 ? `${(p.reviews/1000).toFixed(1)}k` : p.reviews}</div>
                  <div className="pdp-stat-label">Reviews</div>
                </div>
              )}
            </div>
          )}

          {!soldOut && (
            <div className="pdp-qty-row">
              <span className="pdp-qty-label">Qty</span>
              <div className="pdp-qty-ctrl">
                <button className="pdp-qty-btn" onClick={() => setQty(q=>Math.max(1,q-1))} aria-label="Decrease quantity">−</button>
                <span className="pdp-qty-num" aria-live="polite">{qty}</span>
                <button className="pdp-qty-btn" onClick={() => setQty(q=>Math.min(stock, q+1))} disabled={qty >= stock} aria-label="Increase quantity">+</button>
              </div>
              {qty>1 && <span style={{fontSize:"13px",color:"rgba(42,28,12,0.4)"}}>= {fmt(priceNum*qty)}</span>}
            </div>
          )}

          <div className="pdp-actions">
            <button className="pdp-add-btn"
              style={{ background: soldOut ? "#B8B8B8" : addBtnBg, boxShadow: soldOut ? "none" : `0 8px 24px ${shadowColor}`, cursor: soldOut ? "not-allowed" : "pointer" }}
              disabled={soldOut}
              onClick={() => { for(let i=0;i<qty;i++) addToCart({...p,_pageTag:prevPage}); }}>
              {soldOut ? "Sold out" : `Add to Bag — ${fmt(priceNum*qty)}`}
            </button>
            <button className="pdp-fav-btn"
              onClick={() => toggleFavourite({...p,_pageTag:prevPage})}
              aria-label={isFav(p.id)?"Remove from favourites":"Add to favourites"}
              title={isFav(p.id)?"Remove from favourites":"Add to favourites"}>
              {isFav(p.id)?"❤️":"🤍"}
            </button>
          </div>

          <div className="pdp-tag-pills">
            {["Authentic guaranteed","Cash on delivery","Replacement or refund for damaged items"].map(t => (
              <span key={t} className="pdp-tag-pill">✓ {t}</span>
            ))}
          </div>

          {/* Patch-test safety notice — rendered from the shared product template,
              so it appears automatically on every product page (hardcoded or
              admin/Supabase-added) without needing to be set per-product. */}
          <div className="pdp-patch-notice">
            <span className="pdp-patch-icon">⚠️</span>
            <span>
              <strong>Patch test recommended.</strong> Apply a small amount to your inner
              forearm and wait 24–48 hours before full use. Discontinue if irritation occurs.
              See our <Link href="/terms">Terms of Service</Link> for full product safety information.
            </span>
          </div>
        </div>
      </div>

      {/* REVIEWS SECTION: real customer reviews only */}
      <section className="pdp-reviews" aria-labelledby="reviews-heading">
        <h2 id="reviews-heading" className="pdp-reviews-title">Customer reviews</h2>
        <div className="pdp-reviews-sub">
          {hasRealRating
            ? <><StarRating value={p.rating} size={16} /> &nbsp;{p.rating} out of 5 · {p.reviews.toLocaleString()} {p.reviews === 1 ? "review" : "reviews"}</>
            : "No reviews yet. Be the first to share your experience."}
        </div>

        <div className="pdp-write-review">
          <div className="pdp-write-title">Write a review</div>
          {reviewState === "sent" ? (
            <div className="pdp-review-success" role="status">✅ Thank you! Your review has been sent and will appear once we have checked it.</div>
          ) : (
            <>
              <div className="pdp-write-sub">Tell others how this product worked for you. Reviews are checked before they are shown.</div>
              <div className="pdp-star-select" role="radiogroup" aria-label="Your rating">
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button" className="pdp-star-btn" role="radio" aria-checked={form.stars === n} aria-label={`${n} star${n>1?"s":""}`}
                    onMouseEnter={() => setHoverStars(n)}
                    onMouseLeave={() => setHoverStars(0)}
                    onClick={() => setForm(f => ({ ...f, stars: n }))}>
                    {n <= (hoverStars||form.stars) ? "★" : "☆"}
                  </button>
                ))}
                {form.stars>0 && <span style={{fontSize:"13px",color:"rgba(42,28,12,0.4)",marginLeft:"6px",alignSelf:"center"}}>{["","Poor","Fair","Good","Great","Excellent"][form.stars]}</span>}
              </div>
              <div className="pdp-review-fields">
                <input className="pdp-review-input" placeholder="Your name *" maxLength={60} autoComplete="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                <input className="pdp-review-input" placeholder="City (optional)" maxLength={60} autoComplete="address-level2" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
              </div>
              <input className="pdp-review-input" placeholder="Review title (optional)" maxLength={100} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <textarea className="pdp-review-textarea" maxLength={1000}
                placeholder="What worked, what surprised you, would you recommend it? (at least 10 characters)"
                value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} />
              {reviewError && <div className="pdp-review-error" role="alert">{reviewError}</div>}
              <button className="pdp-submit-review" onClick={submitReview}
                disabled={reviewState === "sending" || !form.stars || !form.name.trim() || form.body.trim().length < 10}>
                {reviewState === "sending" ? "Sending…" : "✦ Submit review"}
              </button>
            </>
          )}
        </div>

        {reviews.length > 1 && (
          <div className="pdp-review-filters">
            <div className="pdp-review-filter-group">
              <label className="pdp-review-filter-label" htmlFor="review-sort">Sort</label>
              <select id="review-sort" className="pdp-review-select" value={reviewSort} onChange={e => setReviewSort(e.target.value)}>
                <option value="recent">Most recent</option>
                <option value="highest">Highest rated</option>
                <option value="lowest">Lowest rated</option>
              </select>
            </div>
          </div>
        )}

        <div className="pdp-reviews-grid">
          {visibleReviews.map(r => (
            <article key={r.id} className="pdp-review-card">
              <div className="pdp-review-stars"><StarRating value={r.rating} size={14} /></div>
              {r.title && <div className="pdp-review-name" style={{ marginBottom: "6px" }}>{r.title}</div>}
              <div className="pdp-review-text">{r.body}</div>
              <div className="pdp-review-author">
                <div className="pdp-review-avatar">{(r.reviewer_name || "?").charAt(0).toUpperCase()}</div>
                <div>
                  <div className="pdp-review-name">{r.reviewer_name}{r.city ? <> · <span style={{color:"rgba(42,28,12,0.35)",fontWeight:400}}>{r.city}</span></> : null}</div>
                  <div className="pdp-review-date">{fmtReviewDate(r.created_at)}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
        {sortedReviews.length > 4 && (
          <button className="pdp-show-more-reviews" onClick={() => setShowAllReviews(v => !v)}>
            {showAllReviews ? "Show fewer reviews ↑" : `View all ${sortedReviews.length} reviews ↓`}
          </button>
        )}
      </section>

      {/* RELATED PRODUCTS */}
      {relatedFallback.length > 0 && (
        <div className="pdp-related">
          <div className="pdp-related-title">You may also like</div>
          <div className="pdp-related-grid">
            {relatedFallback.map(r => (
              <div key={r.id} className="pdp-related-card" style={{ "--accent": r.accent }} data-soldout={r.stock <= 0 ? "true" : undefined} onClick={() => openProduct ? openProduct({ ...r, _prevPage: prevPage }) : setPage(prevPage)}>
                <div className="pdp-related-img" style={{ background: r.bg }}>
                  {r.images?.[0]
                    ? <img src={r.images[0]} alt={r.name} loading="lazy" decoding="async" style={{ width:"100%", height:"100%", objectFit:"contain" }} />
                    : <span style={{fontSize:"40px"}}>{r.emoji}</span>}
                </div>
                <div className="pdp-related-brand">{r.brand}</div>
                <div className="pdp-related-name">{r.name}</div>
                <div className="pdp-related-price">{r.price}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STICKY MOBILE ADD-TO-BAG BAR */}
      <div className="pdp-sticky-bar">
        <div className="pdp-sticky-info">
          <div className="pdp-sticky-name">{p.name}</div>
          <div className="pdp-sticky-price" style={{ color:primaryColor }}>{fmt(priceNum*qty)}</div>
        </div>
        <button className="pdp-sticky-fav" onClick={() => toggleFavourite({...p,_pageTag:prevPage})}>{isFav(p.id)?"❤️":"🤍"}</button>
        <button className="pdp-sticky-add" style={{ background:addBtnBg }} onClick={() => { for(let i=0;i<qty;i++) addToCart({...p,_pageTag:prevPage}); }}>
          Add to Bag
        </button>
      </div>
    </div>
  );
}

export default ProductDetailPage;
