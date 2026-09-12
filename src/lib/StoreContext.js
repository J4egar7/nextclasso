"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase.js";

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [cart, setCart]                   = useState([]);
  const [favourites, setFavourites]       = useState([]);
  const [recentOrders, setRecentOrders]   = useState([]);
  const [toast, setToast]                 = useState("");
  const [toastVisible, setToastVisible]   = useState(false);
  const [user, setUser]                   = useState(null);
  const [adminProducts, setAdminProducts] = useState([]);
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

  // Live-sync admin-added products from Firestore.
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), snap => {
      setAdminProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, err => console.error("Failed to load products:", err));
    return () => unsub();
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

  const placeOrder = useCallback(() => {
    const deliveryFee = cartTotal >= 5000 ? 0 : 250;
    const order = {
      id: `ORD-${Date.now()}`,
      items: cart.map(i => ({ id: i.id, name: i.name, brand: i.brand, price: i.price, qty: i.qty, bg: i.bg, emoji: i.emoji })),
      itemsTotal: cartTotal,
      deliveryFee,
      total: cartTotal + deliveryFee,
      placedAt: Date.now(),
    };
    setRecentOrders(o => [order, ...o]);
    setCart([]);
    return order;
  }, [cart, cartTotal]);

  const value = {
    cart, favourites, recentOrders, toast, toastVisible, user, setUser,
    adminProducts, cartOpen, setCartOpen, favOpen, setFavOpen,
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
