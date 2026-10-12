"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./supabase.js";
import { PUBLIC_COLUMNS, mapRowToProduct } from "./productMapper.js";

const StoreContext = createContext(null);

export function StoreProvider({ children, initialProducts = null }) {
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
  const [products, setProducts]           = useState(initialProducts || []);
  const [productsLoaded, setProductsLoaded] = useState(Array.isArray(initialProducts));
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

  const toastTimer = useRef(null);
  const showToast = useCallback((msg) => {
    setToast(msg); setToastVisible(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 3200);
  }, []);

  // Stock-aware: a sold-out product cannot be added, and the quantity can
  // never go above what is in stock. (The database enforces the same rules,
  // this just tells the customer straight away.)
  const stockOf = (item) => (Number.isFinite(item?.stock) ? item.stock : Infinity);

  const addToCart = useCallback((product, pageTag) => {
    const stock = stockOf(product);
    if (stock <= 0) { showToast(`${product.name} is sold out`); return; }
    const existing = cart.find(i => i.id === product.id);
    if (existing && existing.qty + 1 > stock) {
      showToast(`Only ${stock} of ${product.name} available`);
      return;
    }
    setCart(c => {
      const inCart = c.find(i => i.id === product.id);
      if (inCart) return c.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...c, { ...product, _pageTag: pageTag || product._pageTag, qty: 1 }];
    });
    showToast(`Added ${product.name} to cart ✓`);
  }, [cart, showToast]);

  const removeFromCart = useCallback((id) => setCart(c => c.filter(i => i.id !== id)), []);

  const updateCartQty = useCallback((id, delta) => {
    const item = cart.find(i => i.id === id);
    if (item && delta > 0 && item.qty + delta > stockOf(item)) {
      showToast(`Only ${stockOf(item)} of ${item.name} available`);
      return;
    }
    setCart(c => c.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i).filter(i => i.qty > 0));
  }, [cart, showToast]);

  // Keep the cart honest. A cart saved in the browser can be days old, so
  // whenever the live catalogue arrives, refresh each item's price and stock
  // from it and drop anything that has been deleted or sold out.
  useEffect(() => {
    if (!productsLoaded || cart.length === 0) return;
    const byId = new Map(products.map(p => [String(p.id), p]));
    const removed = [];
    let changed = false;
    const next = [];
    for (const item of cart) {
      const fresh = byId.get(String(item.id));
      if (!fresh || fresh.stock <= 0) { removed.push(item.name); changed = true; continue; }
      const qty = Math.min(item.qty, fresh.stock);
      if (qty !== item.qty || fresh.price !== item.price || fresh.stock !== item.stock || fresh.name !== item.name) changed = true;
      next.push({ ...item, name: fresh.name, brand: fresh.brand, price: fresh.price, priceNum: fresh.priceNum,
        images: fresh.images, emoji: fresh.emoji, bg: fresh.bg, accent: fresh.accent, stock: fresh.stock, qty });
    }
    if (!changed) return;
    setCart(next);
    if (removed.length) showToast(`${removed.join(", ")} ${removed.length === 1 ? "is" : "are"} no longer available and was removed from your cart`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, productsLoaded]);

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

  // Saves the order to Supabase through the place_order() RPC. The database
  // is the source of truth: the server recalculates the totals from real
  // catalog prices, and the admin dashboard reads these same rows. A copy
  // is also kept in this browser so the customer's "Your Orders" page works
  // without an account.
  //
  // If the save fails, this returns null and the customer stays on the
  // review step with an error, so nobody is told "order placed" for an
  // order the shop will never see.
  const placeOrder = useCallback(async (customer) => {
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

    const saved = Array.isArray(data) ? data[0] : data;
    if (error || !saved?.id) {
      console.error("Order could not be saved:", error);
      // Our own database rules (stock, limits) write customer-friendly
      // messages, so those are shown as they are. Anything else stays generic.
      const msg = String(error?.message || "");
      const friendly = /out of stock|fewer than|too many orders|quantity must|at least one item|too many different/i.test(msg);
      showToast(friendly ? msg : "We couldn't place your order. Please check your connection and try again.");
      if (friendly) {
        supabase.from("products").select(PUBLIC_COLUMNS).then(({ data, error: e2 }) => {
          if (!e2) setProducts((data || []).map(mapRowToProduct));
        });
      }
      return null;
    }

    const order = {
      id: saved.id,
      items: (saved.items || items).map(i => ({
        id: i.product_id, name: i.name, brand: i.brand, price: i.price, qty: i.qty, bg: i.bg, emoji: i.emoji,
        image: cart.find(c => String(c.id) === String(i.product_id))?.images?.[0] || null,
      })),
      itemsTotal: saved.items_total,
      deliveryFee: saved.delivery_fee,
      total: saved.total,
      placedAt: saved.placed_at ? new Date(saved.placed_at).getTime() : Date.now(),
    };
    setRecentOrders(o => [order, ...o]);
    setCart([]);
    return order;
  }, [cart, showToast]);

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
