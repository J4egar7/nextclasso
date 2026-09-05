"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "./StoreContext.js";
import { pageToPath, pathToPage } from "./routes.js";

import CartDrawer       from "../components/CartDrawer.js";
import FavouritesDrawer from "../components/FavouritesDrawer.js";
import Footer           from "../components/Footer.js";

export default function Shell({ children }) {
  const pathname = usePathname();
  const router   = useRouter();
  const page     = pathToPage(pathname);
  const isAdminRoute = page === "admin-login" || page === "admin";

  const {
    cart, favourites, recentOrders, toast, toastVisible, user, setUser,
    cartOpen, setCartOpen, favOpen, setFavOpen,
    addToCart, removeFromCart, updateCartQty, toggleFavourite, cartTotal, cartCount,
  } = useStore();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  // Same admin-guard behaviour as before: going to "admin" without being
  // signed in as an admin redirects to the login screen instead.
  const navigate = (target) => {
    if (target === "admin" && !user?.isAdmin) {
      router.push(pageToPath("admin-login"));
    } else {
      router.push(pageToPath(target));
    }
  };

  const navColor = () => {
    if (scrolled) return "rgba(255,255,255,0.95)";
    if (page === "makeup") return "rgba(10,0,32,0.55)";
    return "transparent";
  };

  return (
    <>
      {/* TOAST */}
      <div className={`toast ${toastVisible ? "show" : ""}`}>🛍️ {toast}</div>

      {/* NAV — hidden on admin routes */}
      {!isAdminRoute && (
        <nav className={`nav ${scrolled ? "scrolled" : ""}`} style={{ background: navColor() }}>
          <div className="nav-logo" onClick={() => navigate("home")}>CLASO</div>

          <ul className="nav-links">
            {[
              { id: "home",     label: "Home"     },
              { id: "skincare", label: "Skincare"  },
              { id: "makeup",   label: "Makeup"    },
              { id: "about",    label: "About"     },
            ].map(p => (
              <li key={p.id}
                className={`nav-${p.id} ${page === p.id ? "active" : ""}`}
                onClick={() => navigate(p.id)}
                style={{ color: scrolled ? "#1a0a0a" : page === "makeup" ? "white" : "#1a0a0a" }}>
                {p.label}
              </li>
            ))}
          </ul>

          <div className="nav-desktop-right" style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div className="nav-heart" onClick={() => setFavOpen(true)}>
              {favourites.length > 0 ? "❤️" : "🤍"}
              {favourites.length > 0 && <span className="fav-badge">{favourites.length}</span>}
            </div>
            <div className="nav-cart" onClick={() => setCartOpen(true)} style={{ cursor: "pointer" }}>
              🛍️
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </div>
            {user?.isAdmin && (
              <div
                className={`nav-user-badge ${scrolled || page !== "makeup" ? "dark" : ""}`}
                onClick={() => navigate("admin")}
                title="Go to Admin Panel"
                style={{ cursor: "pointer" }}
              >
                ⚙️ Admin
              </div>
            )}
          </div>

          <button
            className={`nav-hamburger ${page === "makeup" && !scrolled ? "light" : ""}`}
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <span /><span /><span />
          </button>
        </nav>
      )}

      {/* MOBILE SLIDE-IN MENU */}
      {!isAdminRoute && mobileMenuOpen && (
        <>
          <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)} />
          <div className="mobile-menu">
            <div className="mobile-menu-head">
              <span className="mobile-menu-logo">CLASO</span>
              <button className="mobile-menu-close" onClick={() => setMobileMenuOpen(false)}>✕</button>
            </div>
            <div className="mobile-menu-links">
              {[
                { id: "home",     label: "Home",     icon: "🏠", cls: ""          },
                { id: "skincare", label: "Skincare",  icon: "🌿", cls: "skin-link" },
                { id: "makeup",   label: "Makeup",    icon: "💄", cls: "make-link" },
                { id: "about",    label: "About",     icon: "✦",  cls: "about-link"},
              ].map(l => (
                <button key={l.id}
                  className={`mobile-menu-link ${page === l.id ? "active-link " + l.cls : ""}`}
                  onClick={() => { navigate(l.id); setMobileMenuOpen(false); }}>
                  <span className="mobile-menu-link-icon">{l.icon}</span>{l.label}
                </button>
              ))}
              {user?.isAdmin && (
                <>
                  <div className="mobile-menu-divider" />
                  <button className="mobile-menu-link" onClick={() => { navigate("admin"); setMobileMenuOpen(false); }}>
                    <span className="mobile-menu-link-icon">⚙️</span>Admin Panel
                  </button>
                </>
              )}
            </div>
            <div className="mobile-menu-footer">
              {user?.isAdmin && (
                <>
                  <div className="mobile-user-row">
                    <span style={{ fontSize: "24px" }}>⚙️</span>
                    <div>
                      <div className="mobile-user-name">Admin</div>
                      <div className="mobile-user-sub">Administrator</div>
                    </div>
                  </div>
                  <button className="mobile-logout-btn" onClick={() => { setUser(null); setMobileMenuOpen(false); }}>
                    🚪 Sign Out
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* MOBILE BOTTOM TAB BAR */}
      {!isAdminRoute && (
        <div className="mobile-bottom-bar">
          <button className="mobile-tab" onClick={() => setFavOpen(true)}>
            <span className="mobile-tab-icon">{favourites.length > 0 ? "❤️" : "🤍"}</span>
            <span className="mobile-tab-label">Saved</span>
            {favourites.length > 0 && <span className="mobile-tab-badge">{favourites.length}</span>}
          </button>
          <button className="mobile-tab" onClick={() => setCartOpen(true)}>
            <span className="mobile-tab-icon">🛍️</span>
            <span className="mobile-tab-label">Cart</span>
            {cartCount > 0 && <span className="mobile-tab-badge">{cartCount}</span>}
          </button>
          <button className="mobile-tab" onClick={() => navigate("checkout")}>
            <span className="mobile-tab-icon">💳</span>
            <span className="mobile-tab-label">Checkout</span>
          </button>
          {user?.isAdmin && (
            <button className="mobile-tab" onClick={() => navigate("admin")}>
              <span className="mobile-tab-icon">⚙️</span>
              <span className="mobile-tab-label">Admin</span>
            </button>
          )}
        </div>
      )}

      {/* PAGE CONTENT */}
      {children}

      {/* DRAWERS */}
      {cartOpen && <CartDrawer cart={cart} removeFromCart={removeFromCart} updateCartQty={updateCartQty} cartTotal={cartTotal} onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); navigate("checkout"); }} />}
      {favOpen  && <FavouritesDrawer favourites={favourites} toggleFavourite={toggleFavourite} addToCart={addToCart} recentOrders={recentOrders} onClose={() => setFavOpen(false)} />}

      {!isAdminRoute && <Footer setPage={navigate} goToProducts={(sub) => navigate(sub)} />}
    </>
  );
}
