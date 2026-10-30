// Closing feature — pink glass panel, product-in-hand photo, giant CLASO wordmark.
// Photo: "a l" / Unsplash. The photo has a white backdrop; mix-blend-mode: multiply
// (see CSS) melts it into the pink so only the hand + bottle show.
const HAND_PHOTO =
  "https://images.unsplash.com/photo-1533282169006-cb33d3642e30?auto=format&fit=crop&w=1600&q=80";

const COLS = [
  { h: "Shop",  links: [["Skincare", "skincare"], ["Makeup", "makeup"], ["Fragrances", "fragrances"], ["Hair Care", "hair-care"]] },
  { h: "Help",  links: [["Returns", "returns"], ["Contact Us", "contact"], ["FAQ", "faq"]] },
  { h: "CLASO", links: [["Our Story", "about"], ["Brands", "brands"]] },
];

export default function ClosingFeature({ setPage, goToProducts }) {
  return (
    <section className="closing-feature">
      <div className="cf-panel">
        <img className="cf-photo" src={HAND_PHOTO} alt="Hand holding a skincare bottle" loading="lazy" />

        <div className="cf-glass">
          <div className="cf-cols">
            {COLS.map(c => (
              <div key={c.h} className="cf-col">
                <div className="cf-col-h">{c.h}</div>
                {c.links.map(([label, page]) => (
                  <button key={label} className="cf-link" onClick={() => setPage && setPage(page)}>{label}</button>
                ))}
              </div>
            ))}
          </div>
          <div className="cf-real">
            <div className="cf-real-h">Real Results.</div>
            <p>Authentic products, honest prices, and a routine that actually works for your skin.</p>
            <button className="btn-primary" onClick={() => goToProducts && goToProducts("skincare")}>Shop the glow</button>
          </div>
        </div>

        <div className="cf-wordmark" aria-hidden="true">CLASO</div>
      </div>
      <div className="cf-credit">Photography via Unsplash — Ernest Brillo, a l</div>
    </section>
  );
}
