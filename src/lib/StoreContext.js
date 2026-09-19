"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase.js";

const StoreContext = createContext(null);

// DB rows are snake_case; the rest of the app (built for the old Firestore
// shape) expects camelCase — map once here so nothing else has to change.
function mapRowToProduct(row) {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    category: row.category,
    price: row.price,
    priceNum: row.price_num,
    old: row.old_price,
    stock: row.stock,
    description: row.description,
    desc: row.description,
    weight: row.weight,
    weightUnit: row.weight_unit,
    images: row.images || [],
    emoji: row.emoji,
    bg: row.bg,
    badge: row.badge,
    rating: row.rating,
    reviews: row.reviews,
    purchases: row.purchases,
    views: row.views,
  };
}

export function StoreProvider({ children }) {
  const [cart, setCart]                   = useState([]);
  const [favourites, setFavourites]       = useState([]);
  const [recentOrders, setRecentOrders]   = useState([]);
  const [toast, setToast]                 = useState("");
  const [toastVisible, setToastVisible]   = useState(false);
  const [user, setUser]                   = useState(null);
  // Was user null on first render because no one's logged in, or because
  // we haven't finished checking for an existing session yet? Without
  // this distinction, AdminPage would redirect to the login screen on
  // every refresh even for an already-logged-in admin, since `user`
  // starts null either way and the check below is async.
  const [authChecked, setAuthChecked]     = useState(false);
  // The entire product catalog now lives in Supabase — this used to hold
  // only admin-added products, merged in each screen with a hardcoded
  // catalog import. That hardcoded catalog is gone; this is the full
  // storefront catalog now.
  const [products, setProducts]           = useState([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [cartOpen, setCartOpen]           = useState(false);
  const [favOpen, setFavOpen]             = useState(false);

  // Cart & favourites survive a refresh now that pages have real URLs —
  // persisted to localStorage so they also survive closing the tab.
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("claso_cart");
      const savedFav  = localStorage.getItem("claso_favourites");
      const savedOrders = localStorage.getItem("claso_recent_orders");
      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedFav)  setFavourites(JSON.parse(savedFav));
      if (savedOrders) setRecentOrders(JSON.parse(savedOrders));
    } catch { /* ignore corrupt storage */ }
  }, []);
  useEffect(() => { try { localStorage.setItem("claso_cart", JSON.stringify(cart)); } catch {} }, [cart]);
  useEffect(() => { try { localStorage.setItem("claso_favourites", JSON.stringify(favourites)); } catch {} }, [favourites]);
  useEffect(() => { try { localStorage.setItem("claso_recent_orders", JSON.stringify(recentOrders)); } catch {} }, [recentOrders]);

  // Live-sync the full product catalog from Supabase — an initial fetch,
  // then a realtime subscription so new/edited/deleted products show up
  // immediately without a refresh.
  // Note: only public-safe columns are selected — manufacturing_cost is
  // deliberately left out of this query so it's never sent to the browser
  // (and is now also blocked at the database level even if it were asked
  // for — see supabase-schema.sql).
  useEffect(() => {
    const PUBLIC_COLUMNS = "id, name, brand, category, price, price_num, old_price, stock, description, weight, weight_unit, images, emoji, bg, badge, rating, reviews, purchases, views";

    supabase.from("products").select(PUBLIC_COLUMNS).then(({ data, error }) => {
      if (error) { console.error("Failed to load products:", error); setProductsLoaded(true); return; }
      setProducts((data || []).map(mapRowToProduct));
      setProductsLoaded(true);
    });

    const channel = supabase
      .channel("products-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        // Any change — just refetch the public-safe columns again.
        supabase.from("products").select(PUBLIC_COLUMNS).then(({ data, error }) => {
          if (!error) setProducts((data || []).map(mapRowToProduct));
        });
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // Restore an existing admin session on page load/refresh — without
  // this, `user` starts null on every refresh (it's just React state,
  // not tied to the actual Supabase Auth session), so a logged-in admin
  // got bounced to the login screen on every reload even though their
  // session was still valid.
  useEffect(() => {
    let cancelled = false;

    const syncFromSession = async (session) => {
      if (!session?.user) {
        if (!cancelled) { setUser(null); setAuthChecked(true); }
        return;
      }
      const { data: adminRow } = await supabase
        .from("admins")
        .select("id")
        .eq("id", session.user.id)
        .maybeSingle();
      if (cancelled) return;
      if (adminRow) {
        setUser({ name: "Admin", email: session.user.email, uid: session.user.id, isAdmin: true });
      } else {
        setUser(null);
      }
      setAuthChecked(true);
    };

    supabase.auth.getSession().then(({ data }) => syncFromSession(data.session));

    // Keep in sync across tabs / after token refresh / on sign-out.
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      syncFromSession(session);
    });

    return () => { cancelled = true; authListener?.subscription?.unsubscribe(); };
  }, []);

  const showToast = useCallback((msg) => {
    setToast(msg); setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  }, []);

  const addToCart = useCallback((product, pageTag) => {
    setCart(c => {
      const existing = c.find(i => i.id === product.id);
      if (existing) return c.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...c, { ...product, _pageTag: pageTag || product._pageTag, qty: 1 }];
    });
    showToast(`Added ${product.name} to cart ✓`);
  }, [showToast]);

  const removeFromCart = useCallback((id) => setCart(c => c.filter(i => i.id !== id)), []);

  const updateCartQty = useCallback((id, delta) => {
    setCart(c => c.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i).filter(i => i.qty > 0));
  }, []);

  const toggleFavourite = useCallback((product) => {
    setFavourites(f => {
      const isFavAlready = f.some(i => i.id === product.id);
      if (isFavAlready) { showToast("Removed from favourites"); return f.filter(i => i.id !== product.id); }
      showToast("Added to favourites ♥");
      return [...f, product];
    });
  }, [showToast]);

  const isFav = useCallback((id) => favourites.some(i => i.id === id), [favourites]);

  const cartTotal = cart.reduce((sum, i) => sum + (parseInt((i.price || "").replace(/[^0-9]/g, "")) || 0) * i.qty, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  // Places the order two places: written to Supabase via the place_order()
  // RPC (the real, shared record the admin dashboard reads from), and kept
  // in localStorage too (so "My Orders" still works instantly for the
  // customer without needing an account).
  //
  // Uses supabase.rpc("place_order", ...) rather than a raw
  // .from("orders").insert() — a raw insert's RETURNING clause requires
  // the calling (anon) role to be able to read back the row it just
  // wrote, which it can't under RLS (customers aren't allowed to read
  // the order list), so that insert always failed silently before this
  // fix. The RPC runs server-side and hands back just the one order it
  // created. The server also recalculates items_total/delivery_fee/total
  // from real catalog prices rather than trusting what this client sent —
  // see recalculate_order_total() in supabase-schema.sql — so `order`
  // below reflects the verified total, which is what's shown to the
  // customer and should match unless a price changed mid-checkout.
  //
  // If the Supabase call fails for some reason (offline, etc.), the order
  // still completes locally rather than blocking checkout — but is
  // logged so it's not silently lost.
  const placeOrder = useCallback(async (customer) => {
    const deliveryFee = cartTotal >= 5000 ? 0 : 250;
    const items = cart.map(i => ({
      product_id: i.id, name: i.name, brand: i.brand, price: i.price,
      qty: i.qty, bg: i.bg, emoji: i.emoji,
    }));

    const { data, error } = await supabase.rpc("place_order", {
      p_customer_name: customer?.name || "",
      p_customer_email: customer?.email || "",
      p_customer_phone: customer?.phone || "",
      p_customer_address: customer?.address || "",
      p_items: items,
    });

    if (error) console.error("Order failed to save to Supabase (kept locally only):", error);
    const saved = Array.isArray(data) ? data[0] : data;

    const order = {
      id: saved?.id || `local-${Date.now()}`,
      items: (saved?.items || items).map(i => ({ id: i.product_id, name: i.name, brand: i.brand, price: i.price, qty: i.qty, bg: i.bg, emoji: i.emoji })),
      itemsTotal: saved?.items_total ?? cartTotal,
      deliveryFee: saved?.delivery_fee ?? deliveryFee,
      total: saved?.total ?? (cartTotal + deliveryFee),
      placedAt: saved?.placed_at ? new Date(saved.placed_at).getTime() : Date.now(),
    };
    setRecentOrders(o => [order, ...o]);
    setCart([]);
    return order;
  }, [cart, cartTotal]);

  const value = {
    cart, favourites, recentOrders, toast, toastVisible, user, setUser, authChecked,
    products, productsLoaded, cartOpen, setCartOpen, favOpen, setFavOpen,
    showToast, addToCart, removeFromCart, updateCartQty,
    toggleFavourite, isFav, cartTotal, cartCount, placeOrder,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within a StoreProvider");
  return ctx;
}
