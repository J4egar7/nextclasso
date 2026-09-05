import { useState } from "react";
import { productReviews } from "../data/reviews.js";
import { skinTones } from "../data/filters.js";
import { skincareProducts, makeupProducts } from "../data/products.js";

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

function ProductDetailPage({ product: p, setPage, addToCart, toggleFavourite, isFav, prevPage, recentOrders, openProduct }) {
  const [qty, setQty] = useState(1);
  const [activeThumb, setActiveThumb] = useState(0);
  const [reviewStars, setReviewStars] = useState(0);
  const [hoverStars, setHoverStars] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [userReviews, setUserReviews] = useState([]);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [selectedTone, setSelectedTone] = useState(null);
  const [reviewSort, setReviewSort] = useState("recent");
  const [reviewCity, setReviewCity] = useState("All");
  const [showAllReviews, setShowAllReviews] = useState(false);

  const isMakeup = prevPage === "makeup";
  const hasPurchased = recentOrders && recentOrders.some(o => o.id === p.id);
  const backLabel = prevPage === "makeup" ? "Makeup" : prevPage === "home" ? "Home" : "Skincare";

  const primaryColor = isMakeup ? "var(--make-primary)" : "var(--skin-primary)";
  const addBtnBg     = isMakeup
    ? "linear-gradient(135deg,var(--make-primary),#FF6BC8)"
    : "linear-gradient(135deg,var(--skin-primary),var(--skin-secondary))";
  const shadowColor  = isMakeup ? "rgba(233,30,140,0.3)" : "rgba(201,116,143,0.3)";

  const priceNum = parseInt((p.price||"").replace(/[^0-9]/g,""))||0;
  const oldNum = p.old ? parseInt((p.old||"").replace(/[^0-9]/g,"")) : 0;
  const pctOff = oldNum && priceNum ? Math.round(100 - (priceNum/oldNum)*100) : 0;

  const pool = isMakeup ? makeupProducts : skincareProducts;
  const related = pool.filter(x => x.id !== p.id && x.category === p.category).slice(0,4);
  const relatedFallback = related.length ? related : pool.filter(x => x.id !== p.id).slice(0,4);

  const fmt = n => "PKR " + n.toLocaleString("en-PK");

  const thumbSlots = [
    { emoji: p.emoji, bg: p.bg || "linear-gradient(135deg,#F5EDD8,#EDD9B4)" },
    { emoji: p.emoji, bg: "linear-gradient(135deg,#EEE8E0,#E0D8CC)" },
    { emoji: "✨",    bg: "linear-gradient(135deg,#F0F0EC,#E4E4DC)" },
  ];

  const submitReview = () => {
    if (!reviewStars || !reviewText.trim()) return;
    setUserReviews(r => [{ name:"You", avatar:"😊", city:"Pakistan", text:reviewText, rating:reviewStars, date:"Just now" }, ...r]);
    setReviewText(""); setReviewStars(0);
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 3000);
  };

  const allReviews = [...userReviews, ...productReviews];
  const reviewCities = ["All", ...Array.from(new Set(productReviews.map(r => r.city))).sort()];
  const sortedReviews = [...allReviews]
    .filter(r => reviewCity === "All" || r.city === reviewCity)
    .sort((a, b) => {
      if (reviewSort === "highest") return b.rating - a.rating;
      if (reviewSort === "lowest") return a.rating - b.rating;
      // "recent": user's own just-submitted reviews (no date) float first, then by date desc
      if (!a.date && !b.date) return 0;
      if (!a.date) return -1;
      if (!b.date) return 1;
      return new Date(b.date) - new Date(a.date);
    });
  const visibleReviews = showAllReviews ? sortedReviews : sortedReviews.slice(0, 4);
  const fmtReviewDate = d => d ? new Date(d).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "Just now";

  return (
    <div className="pdp-page">
      <div className="pdp-breadcrumb">
        <span onClick={() => setPage("home")}>Home</span> /{" "}
        <span onClick={() => setPage(prevPage)}>{backLabel}</span> /{" "}
        {p.category && <><span onClick={() => setPage(prevPage)}>{p.category}</span> / </>}
        <span className="pdp-breadcrumb-current">{p.name}</span>
      </div>
      <button className="pdp-back" onClick={() => setPage(prevPage)}>
        ← Back to {backLabel}
      </button>

      <div className="pdp-hero">
        {/* LEFT — Images */}
        <div className="pdp-image-area">
          <div className="pdp-main-img" style={{ background: thumbSlots[activeThumb].bg }}>
            <span>{thumbSlots[activeThumb].emoji}</span>
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
                {t.emoji}
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
            <StarRating value={p.rating||5} size={17} />
            <span className="pdp-rating-val">{p.rating||5.0}</span>
            <span className="pdp-review-count">({(p.reviews||0).toLocaleString()} reviews)</span>
          </div>

          <div style={{ marginBottom:"4px", display:"flex", alignItems:"center", gap:"10px", flexWrap:"wrap" }}>
            <span className="pdp-price" style={{ color:primaryColor }}>{p.price}</span>
            {p.old && <span className="pdp-price-old">{p.old}</span>}
            {pctOff > 0 && <span className="pdp-save-badge">Save {pctOff}%</span>}
          </div>
          <div className="pdp-delivery-note">
            🚚 {priceNum*qty >= 5000 ? "Free delivery included" : `Add ${fmt(5000-priceNum*qty)} more for free delivery`}
          </div>

          <div className="pdp-divider" />
          <p className="pdp-desc">{p.desc || "A beautifully crafted formula developed with the finest globally-sourced ingredients. Rigorously tested by dermatologists and verified for quality."}</p>

          {isMakeup && (
            <div className="skin-tone-row">
              <div className="skin-tone-label">Choose Skin Tone{selectedTone ? ` — ${selectedTone}` : ""}</div>
              <div className="skin-tone-swatches">
                {skinTones.map(t => (
                  <div key={t.name} className={"skin-tone-swatch" + (selectedTone===t.name?" selected":"")}
                    style={{ background:t.color }} title={t.name}
                    onClick={() => setSelectedTone(selectedTone===t.name?null:t.name)} />
                ))}
              </div>
              {selectedTone && <div className="skin-tone-name">Selected: {selectedTone}</div>}
            </div>
          )}

          <div className="pdp-stats-grid">
            <div className="pdp-stat">
              <div className="pdp-stat-icon">⭐</div>
              <div className="pdp-stat-val" style={{ color:primaryColor }}>{p.rating||5.0}</div>
              <div className="pdp-stat-label">Rating</div>
            </div>
            <div className="pdp-stat">
              <div className="pdp-stat-icon">🛍️</div>
              <div className="pdp-stat-val">{p.purchases?(p.purchases>=1000?`${(p.purchases/1000).toFixed(1)}k`:p.purchases):"500+"}</div>
              <div className="pdp-stat-label">Purchased</div>
            </div>
            <div className="pdp-stat">
              <div className="pdp-stat-icon">💬</div>
              <div className="pdp-stat-val">{p.reviews?(p.reviews>=1000?`${(p.reviews/1000).toFixed(1)}k`:p.reviews):"100+"}</div>
              <div className="pdp-stat-label">Reviews</div>
            </div>
          </div>

          <div className="pdp-qty-row">
            <span className="pdp-qty-label">Qty</span>
            <div className="pdp-qty-ctrl">
              <button className="pdp-qty-btn" onClick={() => setQty(q=>Math.max(1,q-1))}>−</button>
              <span className="pdp-qty-num">{qty}</span>
              <button className="pdp-qty-btn" onClick={() => setQty(q=>q+1)}>+</button>
            </div>
            {qty>1 && <span style={{fontSize:"13px",color:"rgba(42,28,12,0.4)"}}>= {fmt(priceNum*qty)}</span>}
          </div>

          <div className="pdp-actions">
            <button className="pdp-add-btn"
              style={{ background:addBtnBg, boxShadow:`0 8px 24px ${shadowColor}` }}
              onClick={() => { for(let i=0;i<qty;i++) addToCart({...p,_pageTag:prevPage}); }}>
              Add to Bag — {fmt(priceNum*qty)}
            </button>
            <button className="pdp-fav-btn"
              onClick={() => toggleFavourite({...p,_pageTag:prevPage})}
              title={isFav(p.id)?"Remove from favourites":"Add to favourites"}>
              {isFav(p.id)?"❤️":"🤍"}
            </button>
          </div>

          <div className="pdp-tag-pills">
            {["Free Returns","Sealed & Tracked","Authentic Guaranteed","Fast Dispatch"].map(t => (
              <span key={t} className="pdp-tag-pill">✓ {t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* REVIEWS SECTION */}
      <div className="pdp-reviews">
        <div className="pdp-reviews-title">What customers are saying</div>
        <div className="pdp-reviews-sub">
          ★★★★★ &nbsp;{p.rating||5.0} out of 5 · {(p.reviews||productReviews.length).toLocaleString()} verified reviews
        </div>

        <div className="pdp-write-review">
          <div className="pdp-write-title">Write a Review</div>
          {!hasPurchased ? (
            <>
              <div className="pdp-write-sub">Share your experience with this product</div>
              <div className="pdp-write-locked">
                <span style={{fontSize:"24px"}}>🔒</span>
                <span>You need to <strong>purchase this product</strong> before leaving a review. Only verified buyers can review.</span>
              </div>
            </>
          ) : (
            <>
              <div className="pdp-write-sub">You purchased this — share your experience!</div>
              <div className="pdp-star-select">
                {[1,2,3,4,5].map(s => (
                  <button key={s} className="pdp-star-btn"
                    onMouseEnter={() => setHoverStars(s)}
                    onMouseLeave={() => setHoverStars(0)}
                    onClick={() => setReviewStars(s)}>
                    {s <= (hoverStars||reviewStars) ? "★" : "☆"}
                  </button>
                ))}
                {reviewStars>0 && <span style={{fontSize:"13px",color:"rgba(42,28,12,0.4)",marginLeft:"6px",alignSelf:"center"}}>{["","Poor","Fair","Good","Great","Excellent"][reviewStars]}</span>}
              </div>
              <textarea className="pdp-review-textarea"
                placeholder="Tell others what you think — what worked, what surprised you, would you recommend it?"
                value={reviewText} onChange={e => setReviewText(e.target.value)} />
              <button className="pdp-submit-review" onClick={submitReview} disabled={!reviewStars||!reviewText.trim()}>
                ✦ Submit Review
              </button>
              {reviewSubmitted && <div className="pdp-review-success">✅ Thank you! Your review has been posted.</div>}
            </>
          )}
        </div>

        <div className="pdp-review-filters">
          <div className="pdp-review-filter-group">
            <span className="pdp-review-filter-label">Sort</span>
            <select className="pdp-review-select" value={reviewSort} onChange={e => setReviewSort(e.target.value)}>
              <option value="recent">Most Recent</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
            </select>
          </div>
          <div className="pdp-review-filter-group">
            <span className="pdp-review-filter-label">City</span>
            <select className="pdp-review-select" value={reviewCity} onChange={e => setReviewCity(e.target.value)}>
              {reviewCities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="pdp-reviews-grid">
          {visibleReviews.map((r,i) => (
            <div key={i} className="pdp-review-card">
              <div className="pdp-review-stars"><StarRating value={r.rating} size={14} /></div>
              <div className="pdp-review-text">"{r.text}"</div>
              <div className="pdp-review-author">
                <div className="pdp-review-avatar">{r.avatar}</div>
                <div>
                  <div className="pdp-review-name">{r.name} · <span style={{color:"rgba(42,28,12,0.35)",fontWeight:400}}>{r.city}</span></div>
                  <div className="pdp-review-date">{fmtReviewDate(r.date)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {sortedReviews.length > 4 && (
          <button className="pdp-show-more-reviews" onClick={() => setShowAllReviews(s => !s)}>
            {showAllReviews ? "Show Fewer Reviews ↑" : `View All ${sortedReviews.length} Reviews ↓`}
          </button>
        )}
      </div>

      {/* RELATED PRODUCTS */}
      {relatedFallback.length > 0 && (
        <div className="pdp-related">
          <div className="pdp-related-title">You may also like</div>
          <div className="pdp-related-grid">
            {relatedFallback.map(r => (
              <div key={r.id} className="pdp-related-card" onClick={() => openProduct ? openProduct({ ...r, _prevPage: prevPage }) : setPage(prevPage)}>
                <div className="pdp-related-img" style={{ background: r.bg }}>
                  <span style={{fontSize:"40px"}}>{r.emoji}</span>
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
