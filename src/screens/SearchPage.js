import { useState, useEffect, useMemo } from "react";
import ProductCard from "../components/ProductCard.js";

// Simple, forgiving product search: every word you type has to match
// somewhere in the name, brand, category or description.
function scoreProduct(p, words) {
  const name = (p.name || "").toLowerCase();
  const brand = (p.brand || "").toLowerCase();
  const hay = `${name} ${brand} ${(p.category || "").toLowerCase()} ${(p.description || "").toLowerCase()}`;
  let score = 0;
  for (const w of words) {
    if (!hay.includes(w)) return 0;
    if (name.startsWith(w) || brand.startsWith(w)) score += 5;
    else if (name.includes(w) || brand.includes(w)) score += 3;
    else score += 1;
  }
  return score;
}

function SearchPage({ products, productsLoaded, addToCart, toggleFavourite, isFav, openProduct }) {
  const [q, setQ] = useState("");

  // Pick up ?q= from the address bar after the page loads.
  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get("q");
    if (initial) setQ(initial);
  }, []);

  const onChange = (value) => {
    setQ(value);
    const url = value.trim() ? `/search?q=${encodeURIComponent(value.trim())}` : "/search";
    window.history.replaceState(null, "", url);
  };

  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const results = useMemo(() => {
    if (words.length === 0) return [];
    return (products || [])
      .map(p => ({ p, score: scoreProduct(p, words) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score || (b.p.stock > 0) - (a.p.stock > 0))
      .map(x => x.p);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, products]);

  return (
    <div className="page page-enter">
      <section className="skin-section category-browse">
        <div className="skin-section-header">
          <div className="skin-eyebrow">Search</div>
          <h1 className="skin-section-title">Find your <em>next favourite</em></h1>
        </div>

        <div className="search-box">
          <label htmlFor="site-search" className="sr-only">Search products</label>
          <input
            id="site-search"
            className="search-input"
            type="search"
            autoFocus
            autoComplete="off"
            placeholder="Search by product, brand or category"
            value={q}
            onChange={e => onChange(e.target.value)}
          />
        </div>

        <div className="search-status" role="status" aria-live="polite">
          {words.length === 0
            ? "Type a product, brand or category to start."
            : !productsLoaded && results.length === 0 ? "Searching…"
            : results.length === 0 ? `No products found for "${q.trim()}". Try a different word, or check the spelling.`
            : `${results.length} ${results.length === 1 ? "product" : "products"} found`}
        </div>

        {results.length > 0 && (
          <div className="products-grid">
            {results.map(p => <ProductCard key={p.id} p={p} pageTag="search" addToCart={addToCart} toggleFavourite={toggleFavourite} isFav={isFav} openProduct={openProduct} />)}
          </div>
        )}
      </section>
    </div>
  );
}

export default SearchPage;
