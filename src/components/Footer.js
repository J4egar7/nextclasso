// Footer redesigned after the pink glass panel look: SHOP / HELP / CLASO link
// columns, "Real Results." block and a "Shop the glow" CTA, over the giant
// CLASO wordmark. Photo: "a l" / Unsplash (same treatment as the closing feature).
import Link from "next/link";
import { pageToPath } from "../lib/routes.js";

const HAND_PHOTO =
  "https://images.unsplash.com/photo-1533282169006-cb33d3642e30?auto=format&fit=crop&w=1600&q=80";

const COLS = [
  { h: "Shop",  links: [{ label: "Skincare",   page: "skincare"  }, { label: "Makeup",     page: "makeup"     }, { label: "Fragrances", page: "fragrances" }, { label: "Hair Care", page: "hair-care" }] },
  { h: "Help",  links: [{ label: "Returns",    page: "returns"   }, { label: "Contact Us", page: "contact"    }, { label: "FAQ",        page: "faq"        }] },
  { h: "CLASO", links: [{ label: "Our Story",  page: "about"     }, { label: "Brands",     page: "brands"     }] },
];

function Footer({ goToProducts }) {
  return (
    <footer className="closing-feature site-footer">
      <div className="cf-panel">
        <img className="cf-photo" src={HAND_PHOTO} alt="Hand holding a skincare bottle" loading="lazy" />

        <div className="cf-glass">
          <div className="cf-cols">
            {COLS.map(c => (
              <div key={c.h} className="cf-col">
                <div className="cf-col-h">{c.h}</div>
                {c.links.map(l => (
                  <Link key={l.label} href={pageToPath(l.page)} className="cf-link">{l.label}</Link>
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

      <div className="footer-legal-light">
        <div className="footer-copy-light">© 2026 CLASO. All rights reserved. Made with 💄 in Pakistan.</div>
        <div className="footer-legal-links">
          <Link href="/privacy" className="footer-link-a">Privacy Policy</Link>
          <Link href="/terms" className="footer-link-a">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
