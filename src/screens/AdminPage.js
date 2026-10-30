import { useState, useEffect, Fragment } from "react";
import { WEIGHT_UNITS, CATEGORIES, BADGES } from "../data/constants.js";
import { supabase } from "../lib/supabase.js";

const blankForm = {
  name:"", brand:"", category:"Cleansers", price:"", manufacturingCost:"", stock:"",
  description:"", weight:"", weightUnit:"g", images:[],
  emoji:"", bg:"", badge:"",
};

// "PKR 2,800", "2,800" and "2,800.50" all become numbers. It keeps a single
// decimal point, because stripping to digits only would turn "2,800.50" into
// 280050 — the dot is deleted and the two halves are glued together.
const parseAmount = (value) => {
  const n = parseFloat(String(value ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

// DB rows are snake_case; the admin form/table use camelCase — same
// mapping as StoreContext.js.
function mapRowToProduct(row) {
  return {
    id: row.id, name: row.name, brand: row.brand, category: row.category,
    price: row.price, priceNum: row.price_num, stock: row.stock,
    description: row.description, weight: row.weight, weightUnit: row.weight_unit,
    images: row.images || [],
    emoji: row.emoji, bg: row.bg, badge: row.badge,
    rating: row.rating, reviews: row.reviews, purchases: row.purchases, views: row.views,
    // Admin-only. The old mapper dropped this column, so every product looked
    // like it cost PKR 0 to make and "profit" was just the sale price.
    manufacturing_cost: row.manufacturing_cost == null ? null : Number(row.manufacturing_cost),
  };
}

// Phone photos are often 4 to 8 MB. Shrinking them before upload (max 1400px,
// WebP) makes every product page load far faster and keeps storage small.
async function compressImage(file, maxSide = 1400, quality = 0.85) {
  const readOriginal = () => new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = ev => resolve(ev.target.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    canvas.getContext("2d").drawImage(bitmap, 0, 0, w, h);
    const blob = await new Promise(res => canvas.toBlob(res, "image/webp", quality));
    if (!blob || (scale === 1 && blob.size >= file.size)) return readOriginal();
    return await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = ev => resolve(ev.target.result);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
  } catch {
    return readOriginal();
  }
}

function AdminPage({ setPage, user, setUser, authChecked }) {
  const [view, setView] = useState("dashboard");
  const [form, setForm] = useState(blankForm);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewFilter, setReviewFilter] = useState("pending");
  const [subscribers, setSubscribers] = useState([]);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [updatingOrder, setUpdatingOrder] = useState(null);

  // Live-sync the product catalogue from Supabase — this is the single
  // source of truth the storefront also reads from. Admin queries can
  // Select every column except manufacturing_cost (that column is no
  // longer readable by the "authenticated" role at all, admin included,
  // see supabase-security-patch.sql), then fetch costs separately through
  // admin_product_costs(), a function that only returns rows when
  // is_admin() is true. Merged back in below so the rest of the admin UI
  // (the products table, the profit calc) doesn't need to change.
  const ADMIN_PRODUCT_COLUMNS =
    "id, name, brand, category, price, price_num, stock, description, " +
    "weight, weight_unit, images, emoji, bg, badge, rating, reviews, purchases, views, created_at, updated_at";

  useEffect(() => {
    const load = () => {
      Promise.all([
        supabase.from("products").select(ADMIN_PRODUCT_COLUMNS).order("created_at", { ascending: false }),
        supabase.rpc("admin_product_costs"),
      ]).then(([{ data, error }, { data: costs, error: costError }]) => {
        if (error) { console.error(error); setLoadingProducts(false); return; }
        if (costError) console.error(costError); // non-fatal: products still load, costs show as unknown
        // Coerce here rather than trusting the RPC's JSON type: if the
        // function ever returns the cost as text, Number.isFinite() further
        // down would reject it and every product would look cost-less.
        const costById = new Map((costs || []).map(c => [c.id, c.manufacturing_cost == null ? null : Number(c.manufacturing_cost)]));
        setProducts((data || []).map(row => {
          const p = mapRowToProduct(row);
          p.manufacturing_cost = costById.has(row.id) ? costById.get(row.id) : null;
          return p;
        }));
        setLoadingProducts(false);
      });
    };
    load();

    const channel = supabase
      .channel("admin-products-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, load)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // Live-sync orders from Supabase — admins can read every order (RLS:
  // orders_admin_read using is_admin()); customers/anon cannot.
  useEffect(() => {
    const load = () => {
      supabase.from("orders").select("*").order("placed_at", { ascending: false }).then(({ data, error }) => {
        if (error) { console.error(error); setLoadingOrders(false); return; }
        setOrders(data || []);
        setLoadingOrders(false);
      });
    };
    load();

    const channel = supabase
      .channel("admin-orders-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, load)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // Customer reviews waiting for approval (and the ones already decided).
  useEffect(() => {
    const load = () => {
      supabase.from("reviews").select("*").order("created_at", { ascending: false }).then(({ data, error }) => {
        if (!error) setReviews(data || []);
      });
    };
    load();
    const channel = supabase
      .channel("admin-reviews-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, load)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  // Newsletter sign-ups.
  useEffect(() => {
    supabase.from("subscribers").select("*").order("created_at", { ascending: false }).then(({ data, error }) => {
      if (!error) setSubscribers(data || []);
    });
  }, []);

  // Redirect to login only once we've actually finished checking for an
  // existing session — otherwise a real logged-in admin gets bounced to
  // login on every refresh, since `user` starts null either way while
  // that async check is still in flight.
  useEffect(() => {
    if (authChecked && !user?.isAdmin) setPage("admin-login");
  }, [user, authChecked, setPage]);

  if (!authChecked) {
    return <div style={{ padding: "120px 24px", textAlign: "center", color: "#999" }}>Loading…</div>;
  }
  if (!user?.isAdmin) return null;

  const setField = (k,v) => setForm(f => ({...f, [k]:v}));

  const handleImages = async (e) => {
    const files = Array.from(e.target.files || []).filter(f => f.type.startsWith("image/"));
    e.target.value = "";
    const room = Math.max(0, 10 - form.images.length);
    if (files.length > room) setError("You can add up to 10 images per product.");
    const results = [];
    for (const file of files.slice(0, room)) {
      if (file.size > 25 * 1024 * 1024) { setError(`${file.name} is larger than 25 MB.`); continue; }
      results.push(await compressImage(file));
    }
    if (results.length) setForm(f => ({ ...f, images: [...f.images, ...results].slice(0, 10) }));
  };

  const removeImage = (idx) => {
    setForm(f => ({ ...f, images: f.images.filter((_,i)=>i!==idx) }));
  };

  const resetForm = () => { setForm(blankForm); setEditId(null); };

  const handleSave = async () => {
    setError("");
    if (!form.name.trim() || !form.price.trim()) {
      setError("Product name and price are required.");
      return;
    }
    setSaving(true);
    try {
      // Upload any new local files to Supabase Storage; keep existing hosted URLs as-is
      const uploadedUrls = [];
      for (const src of form.images) {
        if (src.startsWith("data:")) {
          const blob = await (await fetch(src)).blob();
          const ext = blob.type.split("/")[1] || "jpg";
          const path = `${editId || "new"}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          const { error: uploadError } = await supabase.storage.from("product-images").upload(path, blob);
          if (uploadError) throw uploadError;
          const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
          uploadedUrls.push(urlData.publicUrl);
        } else {
          uploadedUrls.push(src); // already a hosted URL from a previous save
        }
      }

      // Store prices in one consistent format ("PKR 3,200") however they
      // were typed, so every card on the storefront looks the same.
      const priceNum = Math.round(parseAmount(form.price));
      // A blank cost field now actively clears it (null) instead of silently
      // leaving the old value behind — otherwise a cost could never be undone.
      const costField = String(form.manufacturingCost).trim();
      const payload = {
        name: form.name.trim(),
        brand: form.brand.trim(),
        category: form.category,
        price: priceNum > 0 ? `PKR ${priceNum.toLocaleString("en-US")}` : form.price.trim(),
        price_num: priceNum,
        manufacturing_cost: costField === "" ? null : parseAmount(costField),
        stock: parseInt(form.stock) || 0,
        description: form.description.trim(),
        weight: form.weight,
        weight_unit: form.weightUnit,
        images: uploadedUrls,
        emoji: form.emoji.trim(),
        badge: form.badge,
        updated_at: new Date().toISOString(),
      };

      if (editId) {
        const { error: updateError } = await supabase.from("products").update(payload).eq("id", editId);
        if (updateError) throw updateError;
        setSuccess("Product updated successfully!");
      } else {
        const { error: insertError } = await supabase.from("products").insert(payload);
        if (insertError) throw insertError;
        setSuccess("Product added successfully!");
      }

      resetForm();
      setView("products");
      setTimeout(() => setSuccess(""), 4000);
    } catch (e) {
      console.error(e);
      setError("Could not save product: " + e.message);
    }
    setSaving(false);
  };

  const handleEdit = (p) => {
    setForm({
      name:p.name, brand:p.brand, category:p.category, price:p.price, manufacturingCost: p.manufacturing_cost != null ? String(p.manufacturing_cost) : "",
      stock:String(p.stock), description:p.description, weight:p.weight||"", weightUnit:p.weightUnit||"g",
      images:p.images || [], emoji:p.emoji||"", bg:p.bg||"", badge:p.badge||"",
    });
    setEditId(p.id);
    setView("add");
  };

  // Bestsellers are chosen by hand. The toggle sets or clears badge =
  // "bestseller" on the product. Turning it on replaces any other badge the
  // product had; turning it off leaves the product with no badge.
  const toggleBestseller = async (p) => {
    const next = p.badge === "bestseller" ? "" : "bestseller";
    setProducts(list => list.map(x => x.id === p.id ? { ...x, badge: next } : x));
    const { error: e } = await supabase.from("products").update({ badge: next, updated_at: new Date().toISOString() }).eq("id", p.id);
    if (e) {
      console.error(e);
      setProducts(list => list.map(x => x.id === p.id ? { ...x, badge: p.badge } : x));
      setError("Could not update bestseller: " + e.message);
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This can't be undone.`)) return;
    try {
      const { error: deleteError } = await supabase.from("products").delete().eq("id", p.id);
      if (deleteError) throw deleteError;
      // Best-effort cleanup of images in Storage
      for (const url of (p.images || [])) {
        try {
          if (url.includes("/product-images/")) {
            const path = url.split("/product-images/")[1];
            if (path) await supabase.storage.from("product-images").remove([path]);
          }
        } catch { /* ignore individual cleanup failures */ }
      }
    } catch (e) {
      console.error(e);
      alert("Could not delete product: " + e.message);
    }
  };

  const stockBadge = (n) => n === 0 ? "out" : n < 5 ? "low" : "in";
  const stockLabel = (n) => n === 0 ? "Out of Stock" : n < 5 ? `Low (${n})` : `In Stock (${n})`;

  const parsePrice = (str) => parseAmount(str);
  const fmtPKR = (n) => `PKR ${Math.round(n).toLocaleString()}`;

  // Sales    = sale price x quantity for every item in non-cancelled orders
  //            (delivery fees are not product sales).
  // Profit   = (sale price - manufacturing cost) x quantity.
  // The cost comes from the product's manufacturing_cost, which only the
  // admin can read. An item with no cost set (or whose product was deleted)
  // is left OUT of profit instead of being counted as 100% profit, and the
  // dashboard says how many items were left out.
  const costById = Object.fromEntries(products.map(p => [String(p.id), p.manufacturing_cost]));
  const itemKey = (item) => String(item.product_id ?? item.id);
  // A cost is "usable" only if it is a real number greater than zero. The
  // Number() conversion covers a cost that arrives as text from the RPC.
  const itemCost = (item) => {
    const c = Number(costById[itemKey(item)]);
    return Number.isFinite(c) && c > 0 ? c : null;
  };
  const orderSales = (o) => (o.items || []).reduce((sum, item) => sum + parsePrice(item.price) * (item.qty || 1), 0);
  const orderProfitInfo = (o) => (o.items || []).reduce((acc, item) => {
    const qty = item.qty || 1;
    const cost = itemCost(item);
    if (cost === null) { acc.missing += qty; return acc; }
    acc.profit += (parsePrice(item.price) - cost) * qty;
    return acc;
  }, { profit: 0, missing: 0 });
  // Cancelled orders never count towards sales or profit.
  const countedOrders = orders.filter(o => o.status !== "cancelled");
  const totalRevenue = countedOrders.reduce((sum, o) => sum + orderSales(o), 0);
  const profitTotals = countedOrders.reduce((acc, o) => {
    const info = orderProfitInfo(o);
    return { profit: acc.profit + info.profit, missing: acc.missing + info.missing };
  }, { profit: 0, missing: 0 });
  const totalProfit = profitTotals.profit;
  const productsMissingCost = products.filter(p => !(Number.isFinite(Number(p.manufacturing_cost)) && Number(p.manufacturing_cost) > 0)).length;

  const STATUS_LABELS = { pending: "Pending", delivered: "Fulfilled", cancelled: "Cancelled" };
  const statusOf = (o) => o.status || "pending";
  const pendingCount = orders.filter(o => statusOf(o) === "pending").length;
  const orderNumber = (o) => "#" + String(o.id).replace(/-/g, "").slice(-6).toUpperCase();

  const q = orderSearch.trim().toLowerCase();
  const visibleOrders = orders.filter(o => {
    if (orderStatus !== "all" && statusOf(o) !== orderStatus) return false;
    if (!q) return true;
    const hay = [o.customer_name, o.customer_phone, o.customer_email, o.customer_address, String(o.id), orderNumber(o),
      ...(o.items || []).map(i => i.name)].join(" ").toLowerCase();
    return hay.includes(q);
  });

  const updateOrderStatus = async (o, status) => {
    setError("");
    setUpdatingOrder(o.id);
    const previous = o.status;
    setOrders(list => list.map(x => x.id === o.id ? { ...x, status } : x)); // optimistic
    const { error: updateError } = await supabase.from("orders").update({ status }).eq("id", o.id);
    if (updateError) {
      console.error(updateError);
      setOrders(list => list.map(x => x.id === o.id ? { ...x, status: previous } : x));
      setError("Could not update the order status: " + updateError.message + ". Run supabase-orders-admin.sql in the Supabase SQL editor if you have not yet.");
    }
    setUpdatingOrder(null);
  };

  const deleteOrder = async (o) => {
    const label = orderNumber(o);
    const who = o.customer_name ? ` for ${o.customer_name}` : "";
    if (!window.confirm(`Delete order ${label}${who}? This can't be undone.`)) return;
    setError("");
    setUpdatingOrder(o.id);
    const snapshot = orders; // put the row straight back if the delete fails
    setOrders(list => list.filter(x => x.id !== o.id));
    if (expandedOrder === o.id) setExpandedOrder(null);
    const { error: deleteError } = await supabase.from("orders").delete().eq("id", o.id);
    if (deleteError) {
      console.error(deleteError);
      setOrders(snapshot);
      setError("Could not delete the order: " + deleteError.message + ". Run supabase-orders-admin.sql in the Supabase SQL editor if you have not yet.");
    }
    setUpdatingOrder(null);
  };

  const productNameById = Object.fromEntries(products.map(p => [String(p.id), p.name]));
  const pendingReviews = reviews.filter(r => r.status === "pending").length;
  const visibleReviewRows = reviews.filter(r => reviewFilter === "all" || r.status === reviewFilter);
  const soldOutCount = products.filter(p => (p.stock ?? 0) <= 0).length;
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 5).length;

  const setReviewStatus = async (r, status) => {
    setError("");
    const { error: e } = await supabase.from("reviews").update({ status }).eq("id", r.id);
    if (e) { setError("Could not update the review: " + e.message + ". Run supabase-hardening.sql in the Supabase SQL editor if you have not yet."); return; }
    setReviews(list => list.map(x => x.id === r.id ? { ...x, status } : x));
  };
  const deleteReview = async (r) => {
    if (!window.confirm("Delete this review for good?")) return;
    const { error: e } = await supabase.from("reviews").delete().eq("id", r.id);
    if (e) { setError("Could not delete the review: " + e.message); return; }
    setReviews(list => list.filter(x => x.id !== r.id));
  };
  const exportSubscribersCsv = () => {
    const csv = ["Email,Subscribed", ...subscribers.map(x => `"${String(x.email).replace(/"/g, '""')}",${new Date(x.created_at).toISOString()}`)].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url; a.download = `claso-subscribers-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportOrdersCsv = () => {
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const header = ["Order", "Placed", "Status", "Customer", "Phone", "Email", "Address", "Items", "Items total", "Delivery fee", "Total", "Profit"];
    const rows = visibleOrders.map(o => [
      orderNumber(o),
      o.placed_at ? new Date(o.placed_at).toISOString() : "",
      STATUS_LABELS[statusOf(o)] || statusOf(o),
      o.customer_name, o.customer_phone, o.customer_email, o.customer_address,
      (o.items || []).map(i => `${i.qty}x ${i.name}`).join("; "),
      o.items_total, o.delivery_fee, o.total,
      statusOf(o) === "cancelled" ? 0 : orderProfitInfo(o).profit,
    ]);
    const csv = [header, ...rows].map(r => r.map(esc).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `claso-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page page-enter">
      <div className="admin-layout">
        {/* SIDEBAR */}
        <aside className="admin-sidebar">
          <div className="adm-sidebar-head">
            <div className="adm-sidebar-title">⚙ ADMIN</div>
            <div className="adm-sidebar-sub">Logged in as {user.name}</div>
          </div>
          {[
            { id:"dashboard", icon:"📊", label:"Dashboard" },
            { id:"orders",    icon:"🧾", label:"Orders" },
            { id:"reviews",   icon:"⭐", label:`Reviews${pendingReviews ? ` (${pendingReviews})` : ""}` },
            { id:"subscribers", icon:"✉️", label:"Subscribers" },
            { id:"add",       icon:"➕", label:"Add Product" },
            { id:"products",  icon:"📦", label:"All Products" },
          ].map(n => (
            <button key={n.id} className={`adm-nav-item ${view===n.id?"active":""}`} onClick={()=>{ if(n.id!=="add") resetForm(); setView(n.id); }}>
              <span className="adm-nav-icon">{n.icon}</span>{n.label}
            </button>
          ))}
          <div style={{ flex:1 }} />
          <button className="adm-nav-item" onClick={() => setPage("home")}>
            <span className="adm-nav-icon">🏠</span>Back to Store
          </button>
          <button className="adm-nav-item" onClick={async () => { await supabase.auth.signOut(); setUser(null); setPage("home"); }}>
            <span className="adm-nav-icon">🚪</span>Log Out
          </button>
        </aside>

        {/* MAIN */}
        <main className="admin-main">
          {success && <div className="adm-success-banner">✅ {success}</div>}
          {error && <div className="adm-success-banner" style={{background:"rgba(239,68,68,0.12)",color:"#FCA5A5",border:"1px solid rgba(239,68,68,0.3)"}}>⚠️ {error}</div>}

          {/* DASHBOARD */}
          {view === "dashboard" && (
            <>
              <div className="adm-page-title">Dashboard</div>
              <div className="adm-page-sub">Overview of your CLASO product catalogue</div>
              <div className="adm-stats-grid">
                {[
                  { icon:"💰", val: fmtPKR(totalRevenue), label:"Total Sales" },
                  { icon:"📈", val: fmtPKR(totalProfit), label:"Total Profit (sale price − cost)" },
                  { icon:"🧾", val: orders.length, label:"Total Orders" },
                  { icon:"📦", val: products.length, label:"Total Products" },
                ].map(s => (
                  <div key={s.label} className="adm-stat-card">
                    <div className="adm-stat-icon">{s.icon}</div>
                    <div className="adm-stat-val">{s.val}</div>
                    <div className="adm-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
              {(soldOutCount > 0 || lowStockCount > 0) && (
                <div className="adm-cost-warning">
                  📦 {soldOutCount > 0 ? `${soldOutCount} product${soldOutCount === 1 ? " is" : "s are"} sold out` : ""}
                  {soldOutCount > 0 && lowStockCount > 0 ? " and " : ""}
                  {lowStockCount > 0 ? `${lowStockCount} ${lowStockCount === 1 ? "is" : "are"} running low (5 or fewer)` : ""}.
                  Sold-out products cannot be ordered. Edit a product to update its stock.
                </div>
              )}
              {pendingReviews > 0 && (
                <div className="adm-cost-warning">⭐ {pendingReviews} customer review{pendingReviews === 1 ? " is" : "s are"} waiting for your approval in the Reviews tab.</div>
              )}
              {profitTotals.missing > 0 ? (
                <div className="adm-cost-warning">
                  ⚠️ Profit is leaving out {profitTotals.missing} sold item{profitTotals.missing === 1 ? "" : "s"} with no manufacturing cost set.
                  Open the product, add its cost, and those sales count towards profit.
                </div>
              ) : productsMissingCost > 0 ? (
                <div className="adm-cost-warning">
                  🧮 {productsMissingCost} product{productsMissingCost === 1 ? " has" : "s have"} no manufacturing cost yet, so they are not counted in profit.
                  Nothing has sold without a cost so far.
                </div>
              ) : null}
              <div className="adm-stats-grid">
                {[
                  { icon:"✅", val: products.filter(p=>p.stock>0).length, label:"In Stock" },
                  { icon:"⚠️", val: products.filter(p=>p.stock>0&&p.stock<5).length, label:"Low Stock" },
                  { icon:"❌", val: products.filter(p=>p.stock===0).length, label:"Out of Stock" },
                ].map(s => (
                  <div key={s.label} className="adm-stat-card">
                    <div className="adm-stat-icon">{s.icon}</div>
                    <div className="adm-stat-val">{s.val}</div>
                    <div className="adm-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="adm-table-card">
                <div className="adm-table-head">
                  <div style={{display:"flex",alignItems:"center"}}>
                    <span className="adm-table-title">Recent Products</span>
                    <span className="adm-table-count">{products.length}</span>
                  </div>
                  <button className="adm-btn-primary" onClick={()=>{resetForm();setView("add");}}>＋ Add Product</button>
                </div>
                {loadingProducts ? (
                  <div className="adm-empty"><div className="adm-empty-text">Loading…</div></div>
                ) : products.length === 0 ? (
                  <div className="adm-empty">
                    <div className="adm-empty-icon">📭</div>
                    <div className="adm-empty-text">No products yet</div>
                    <div className="adm-empty-sub">Add your first product to get started</div>
                  </div>
                ) : (
                  <table className="adm-table">
                    <thead><tr>
                      <th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Weight</th>
                    </tr></thead>
                    <tbody>{[...products].slice(-5).reverse().map(p => (
                      <tr key={p.id}>
                        <td>
                          <div className="adm-product-info">
                            <div className="adm-product-thumb">
                              {p.images?.[0] ? <img src={p.images[0]} alt="" style={{width:"100%",height:"100%",objectFit:"contain",borderRadius:"10px"}} /> : (p.emoji || "🛍️")}
                            </div>
                            <div>
                              <div className="adm-product-name">{p.name}</div>
                              <div className="adm-product-brand">{p.brand}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{color:"var(--adm-muted)",fontSize:"13px"}}>{p.category}</td>
                        <td style={{fontWeight:600}}>{p.price}</td>
                        <td><span className={`adm-stock-badge ${stockBadge(p.stock)}`}>{stockLabel(p.stock)}</span></td>
                        <td style={{color:"var(--adm-muted)",fontSize:"13px"}}>{p.weight ? `${p.weight} ${p.weightUnit}` : "—"}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {/* ORDERS */}
          {view === "orders" && (
            <>
              <div className="adm-page-title">Orders</div>
              <div className="adm-page-sub">Every order placed through the storefront, saved in your database</div>

              <div className="adm-order-summary">
                <div className="adm-order-stat"><div className="adm-order-stat-num">{orders.length}</div><div className="adm-order-stat-label">All orders</div></div>
                <div className="adm-order-stat"><div className="adm-order-stat-num">{pendingCount}</div><div className="adm-order-stat-label">Pending</div></div>
                <div className="adm-order-stat"><div className="adm-order-stat-num">{fmtPKR(totalRevenue)}</div><div className="adm-order-stat-label">Sales (excl. cancelled)</div></div>
              </div>

              <div className="adm-table-card">
                <div className="adm-table-head" style={{ flexWrap: "wrap", gap: "12px" }}>
                  <div style={{display:"flex",alignItems:"center"}}>
                    <span className="adm-table-title">Order history</span>
                    <span className="adm-table-count">{visibleOrders.length}</span>
                  </div>
                  <div className="adm-order-toolbar">
                    <input className="adm-input adm-order-search" placeholder="Search name, phone, product, order #" value={orderSearch} onChange={e => setOrderSearch(e.target.value)} />
                    <select className="adm-select adm-order-filter" value={orderStatus} onChange={e => setOrderStatus(e.target.value)}>
                      <option value="all">All statuses</option>
                      <option value="pending">Pending</option>
                      <option value="delivered">Fulfilled</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button className="adm-btn-secondary" onClick={exportOrdersCsv} disabled={visibleOrders.length === 0}>Export CSV</button>
                  </div>
                </div>
                {loadingOrders ? (
                  <div className="adm-empty"><div className="adm-empty-text">Loading…</div></div>
                ) : orders.length === 0 ? (
                  <div className="adm-empty">
                    <div className="adm-empty-icon">🧾</div>
                    <div className="adm-empty-text">No orders yet</div>
                    <div className="adm-empty-sub">Orders placed at checkout will show up here</div>
                  </div>
                ) : visibleOrders.length === 0 ? (
                  <div className="adm-empty">
                    <div className="adm-empty-text">No orders match your search</div>
                  </div>
                ) : (
                  <table className="adm-table">
                    <thead><tr>
                      <th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Placed</th><th>Actions</th>
                    </tr></thead>
                    <tbody>{visibleOrders.map(o => (
                      <Fragment key={o.id}>
                        <tr className="adm-order-row" onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}>
                          <td style={{fontWeight:600}}>{orderNumber(o)}</td>
                          <td>
                            <div className="adm-product-name">{o.customer_name || "—"}</div>
                            <div className="adm-product-brand">{o.customer_phone || "—"}</div>
                          </td>
                          <td style={{color:"var(--adm-muted)",fontSize:"13px"}}>
                            {(o.items || []).slice(0, 2).map((it,i) => (<div key={i}>{it.qty}× {it.name}</div>))}
                            {(o.items || []).length > 2 && <div>+{(o.items || []).length - 2} more</div>}
                          </td>
                          <td style={{fontWeight:600}}>{fmtPKR(o.total || 0)}</td>
                          <td onClick={e => e.stopPropagation()}>
                            <select
                              className={`adm-select adm-status-select ${statusOf(o)}`}
                              value={statusOf(o)}
                              disabled={updatingOrder === o.id}
                              onChange={e => updateOrderStatus(o, e.target.value)}
                            >
                              <option value="pending">Pending</option>
                              <option value="delivered">Fulfilled</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td style={{color:"var(--adm-muted)",fontSize:"13px"}}>{o.placed_at ? new Date(o.placed_at).toLocaleString() : "—"}</td>
                          <td onClick={e => e.stopPropagation()}>
                            <button
                              className="adm-btn-danger"
                              style={{padding:"7px 14px",fontSize:"12px"}}
                              disabled={updatingOrder === o.id}
                              onClick={() => deleteOrder(o)}
                            >🗑 Delete</button>
                          </td>
                        </tr>
                        {expandedOrder === o.id && (
                          <tr className="adm-order-detail">
                            <td colSpan={7}>
                              <div className="adm-order-detail-grid">
                                <div>
                                  <div className="adm-order-detail-title">Customer</div>
                                  <div>{o.customer_name || "—"}</div>
                                  <div>{o.customer_phone || "—"}</div>
                                  <div>{o.customer_email || "—"}</div>
                                  <div style={{marginTop:"6px"}}>{o.customer_address || "—"}</div>
                                </div>
                                <div>
                                  <div className="adm-order-detail-title">Items</div>
                                  {(o.items || []).map((it, i) => (
                                    <div key={i} className="adm-order-line">
                                      <span>{it.qty}× {it.name}{it.brand ? ` (${it.brand})` : ""}</span>
                                      <span>{fmtPKR(parsePrice(it.price) * (it.qty || 1))}</span>
                                    </div>
                                  ))}
                                  <div className="adm-order-line adm-order-line-sum"><span>Items</span><span>{fmtPKR(o.items_total || 0)}</span></div>
                                  <div className="adm-order-line adm-order-line-sum"><span>Delivery fee</span><span>{fmtPKR(o.delivery_fee || 0)}</span></div>
                                  <div className="adm-order-line adm-order-line-sum" style={{fontWeight:700}}><span>Total</span><span>{fmtPKR(o.total || 0)}</span></div>
                                  {statusOf(o) !== "cancelled" && (() => {
                                    const info = orderProfitInfo(o);
                                    return (
                                      <div className="adm-order-line adm-order-line-sum">
                                        <span>Profit (sale price − cost){info.missing > 0 ? ` · ${info.missing} item${info.missing === 1 ? "" : "s"} without a cost` : ""}</span>
                                        <span>{fmtPKR(info.profit)}</span>
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}</tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {/* REVIEWS */}
          {view === "reviews" && (
            <>
              <div className="adm-page-title">Reviews</div>
              <div className="adm-page-sub">Customer reviews only appear on the site after you approve them</div>
              <div className="adm-table-card">
                <div className="adm-table-head" style={{ flexWrap: "wrap", gap: "12px" }}>
                  <div style={{display:"flex",alignItems:"center"}}>
                    <span className="adm-table-title">Reviews</span>
                    <span className="adm-table-count">{visibleReviewRows.length}</span>
                  </div>
                  <select className="adm-select adm-order-filter" value={reviewFilter} onChange={e => setReviewFilter(e.target.value)}>
                    <option value="pending">Waiting for approval</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="all">All</option>
                  </select>
                </div>
                {visibleReviewRows.length === 0 ? (
                  <div className="adm-empty"><div className="adm-empty-icon">⭐</div><div className="adm-empty-text">Nothing here</div></div>
                ) : (
                  <div className="adm-review-list">
                    {visibleReviewRows.map(r => (
                      <div key={r.id} className="adm-review-item">
                        <div className="adm-review-top">
                          <div>
                            <div className="adm-product-name">{productNameById[String(r.product_id)] || "Deleted product"}</div>
                            <div className="adm-product-brand">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)} · {r.reviewer_name}{r.city ? `, ${r.city}` : ""} · {new Date(r.created_at).toLocaleDateString()}</div>
                          </div>
                          <span className={`adm-status-pill ${r.status}`}>{r.status}</span>
                        </div>
                        {r.title && <div style={{ fontWeight: 600, marginTop: "8px" }}>{r.title}</div>}
                        <div className="adm-review-body">{r.body}</div>
                        <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                          {r.status !== "approved" && <button className="adm-btn-primary" onClick={() => setReviewStatus(r, "approved")}>Approve</button>}
                          {r.status !== "rejected" && <button className="adm-btn-secondary" onClick={() => setReviewStatus(r, "rejected")}>Reject</button>}
                          <button className="adm-btn-secondary" onClick={() => deleteReview(r)}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* SUBSCRIBERS */}
          {view === "subscribers" && (
            <>
              <div className="adm-page-title">Subscribers</div>
              <div className="adm-page-sub">People who joined the newsletter from the website</div>
              <div className="adm-table-card">
                <div className="adm-table-head">
                  <div style={{display:"flex",alignItems:"center"}}>
                    <span className="adm-table-title">Email list</span>
                    <span className="adm-table-count">{subscribers.length}</span>
                  </div>
                  <button className="adm-btn-secondary" onClick={exportSubscribersCsv} disabled={subscribers.length === 0}>Export CSV</button>
                </div>
                {subscribers.length === 0 ? (
                  <div className="adm-empty"><div className="adm-empty-icon">✉️</div><div className="adm-empty-text">No subscribers yet</div></div>
                ) : (
                  <table className="adm-table">
                    <thead><tr><th>Email</th><th>Joined</th></tr></thead>
                    <tbody>{subscribers.map(x => (
                      <tr key={x.id}><td>{x.email}</td><td style={{color:"var(--adm-muted)",fontSize:"13px"}}>{new Date(x.created_at).toLocaleString()}</td></tr>
                    ))}</tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {/* ADD / EDIT PRODUCT */}
          {view === "add" && (
            <>
              <div className="adm-page-title">{editId ? "Edit Product" : "Add New Product"}</div>
              <div className="adm-page-sub">{editId ? "Update the product details below." : "Fill in the details to list a new product on CLASO."}</div>

              {/* IMAGE UPLOAD */}
              <div className="adm-form-card">
                <div className="adm-form-title"><span>🖼️</span> Product Images</div>
                <div className="adm-upload-zone">
                  <input className="adm-upload-input" type="file" accept="image/*" multiple onChange={handleImages} />
                  <div className="adm-upload-icon">📸</div>
                  <div className="adm-upload-text"><strong>Click to upload</strong> or drag & drop<br/>PNG, JPG, WEBP — up to 10 images</div>
                </div>
                {form.images.length > 0 && (
                  <div className="adm-img-preview-grid">
                    {form.images.map((src,i) => (
                      <div key={i} className="adm-img-wrap">
                        <img src={src} alt="" className="adm-img-preview" />
                        <button className="adm-img-remove" onClick={()=>removeImage(i)}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* BASIC INFO */}
              <div className="adm-form-card">
                <div className="adm-form-title"><span>📋</span> Basic Information</div>
                <div className="adm-form-grid">
                  <div className="adm-field">
                    <label className="adm-field-label">Product Name *</label>
                    <input className="adm-input" placeholder="e.g. Matte Lipstick Rouge" value={form.name} onChange={e=>setField("name",e.target.value)} />
                  </div>
                  <div className="adm-field">
                    <label className="adm-field-label">Brand</label>
                    <input className="adm-input" placeholder="e.g. Charlotte Tilbury" value={form.brand} onChange={e=>setField("brand",e.target.value)} />
                  </div>
                  <div className="adm-field">
                    <label className="adm-field-label">Category</label>
                    <select className="adm-select" value={form.category} onChange={e=>setField("category",e.target.value)}>
                      {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="adm-field">
                    <label className="adm-field-label">Price (PKR) *</label>
                    <input className="adm-input" placeholder="e.g. PKR 4,500" value={form.price} onChange={e=>setField("price",e.target.value)} />
                  </div>
                  <div className="adm-field">
                    <label className="adm-field-label">Manufacturing cost (PKR)</label>
                    <input className="adm-input" inputMode="numeric" placeholder="What one unit costs you, e.g. 2,800" value={form.manufacturingCost} onChange={e=>setField("manufacturingCost",e.target.value)} />
                    <div style={{fontSize:"11px",color:"var(--adm-muted)",marginTop:"6px"}}>Used for profit (sale price minus this). Never shown to customers.</div>
                  </div>
                  <div className="adm-field span-2">
                    <label className="adm-field-label">Description</label>
                    <textarea className="adm-textarea" placeholder="Write a short product description…" value={form.description} onChange={e=>setField("description",e.target.value)} />
                  </div>
                </div>
              </div>

              {/* DISPLAY */}
              <div className="adm-form-card">
                <div className="adm-form-title"><span>🎨</span> Display</div>
                <div style={{fontSize:"12px",color:"var(--adm-muted)",marginBottom:"14px"}}>
                  Until real product photography is added, cards show this emoji on a white background instead.
                </div>
                <div className="adm-form-grid">
                  <div className="adm-field">
                    <label className="adm-field-label">Emoji</label>
                    <input className="adm-input" placeholder="e.g. 💄" value={form.emoji} onChange={e=>setField("emoji",e.target.value)} maxLength={4} />
                  </div>
                  <div className="adm-field">
                    <label className="adm-field-label">Badge (optional)</label>
                    <select className="adm-select" value={form.badge} onChange={e=>setField("badge",e.target.value)}>
                      {BADGES.map(b=><option key={b} value={b}>{b || "None"}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* STOCK & WEIGHT */}
              <div className="adm-form-card">
                <div className="adm-form-title"><span>📦</span> Stock & Weight</div>
                <div className="adm-form-grid">
                  <div className="adm-field">
                    <label className="adm-field-label">Units in Stock</label>
                    <input className="adm-input" type="number" min="0" placeholder="e.g. 50" value={form.stock} onChange={e=>setField("stock",e.target.value)} />
                  </div>
                  <div className="adm-field">
                    <label className="adm-field-label">Product Weight</label>
                    <div style={{display:"flex",gap:"8px"}}>
                      <input className="adm-input" type="number" min="0" step="0.1" placeholder="e.g. 30" value={form.weight} onChange={e=>setField("weight",e.target.value)} style={{flex:1}} />
                      <select className="adm-select" value={form.weightUnit} onChange={e=>setField("weightUnit",e.target.value)} style={{width:"90px"}}>
                        {WEIGHT_UNITS.map(u => <option key={u}>{u}</option>)}
                      </select>
                    </div>
                    <div style={{fontSize:"11px",color:"var(--adm-muted)",marginTop:"5px"}}>Net weight of the product (e.g. 30 ml, 15 g)</div>
                  </div>
                </div>
              </div>

              <div style={{display:"flex",gap:"12px"}}>
                <button className="adm-btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving…" : editId ? "💾 Save Changes" : "✅ Publish Product"}
                </button>
                <button className="adm-btn-secondary" onClick={()=>{ resetForm(); setView("products"); }}>
                  Cancel
                </button>
              </div>
            </>
          )}

          {/* ALL PRODUCTS */}
          {view === "products" && (
            <>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:"8px"}}>
                <div>
                  <div className="adm-page-title">All Products</div>
                  <div className="adm-page-sub">Manage your full product catalogue</div>
                </div>
                <button className="adm-btn-primary" onClick={()=>{ resetForm(); setView("add"); }}>＋ Add Product</button>
              </div>
              <div className="adm-table-card">
                {loadingProducts ? (
                  <div className="adm-empty"><div className="adm-empty-text">Loading…</div></div>
                ) : products.length === 0 ? (
                  <div className="adm-empty">
                    <div className="adm-empty-icon">📭</div>
                    <div className="adm-empty-text">No products listed yet</div>
                    <div className="adm-empty-sub">Click "Add Product" to create your first listing</div>
                  </div>
                ) : (
                  <table className="adm-table">
                    <thead><tr>
                      <th>Product</th><th>Category</th><th>Price</th><th>Cost</th><th>Profit / unit</th><th>Stock</th><th>Weight</th><th>Bestseller</th><th>Actions</th>
                    </tr></thead>
                    <tbody>{products.map(p => (
                      <tr key={p.id}>
                        <td>
                          <div className="adm-product-info">
                            <div className="adm-product-thumb">
                              {p.images?.[0] ? <img src={p.images[0]} alt="" style={{width:"100%",height:"100%",objectFit:"contain",borderRadius:"10px"}} /> : (p.emoji || "🛍️")}
                            </div>
                            <div>
                              <div className="adm-product-name">{p.name}</div>
                              <div className="adm-product-brand">{p.brand || "—"}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{color:"var(--adm-muted)",fontSize:"13px"}}>{p.category}</td>
                        <td style={{fontWeight:600}}>{p.price}</td>
                        <td style={{fontSize:"13px",color:"var(--adm-muted)"}}>{p.manufacturing_cost > 0 ? fmtPKR(p.manufacturing_cost) : "Not set"}</td>
                        <td style={{fontSize:"13px",fontWeight:600,color: p.manufacturing_cost > 0 ? "var(--adm-primary)" : "var(--adm-muted)"}}>{p.manufacturing_cost > 0 ? fmtPKR(parsePrice(p.price) - p.manufacturing_cost) : "—"}</td>
                        <td><span className={`adm-stock-badge ${stockBadge(p.stock)}`}>{stockLabel(p.stock)}</span></td>
                        <td style={{color:"var(--adm-muted)",fontSize:"13px"}}>{p.weight ? `${p.weight} ${p.weightUnit}` : "—"}</td>
                        <td>
                          <button
                            type="button" role="switch" aria-checked={p.badge === "bestseller"}
                            aria-label={`Bestseller: ${p.name}`}
                            className={`adm-toggle ${p.badge === "bestseller" ? "on" : ""}`}
                            onClick={()=>toggleBestseller(p)}
                          ><span /></button>
                        </td>
                        <td>
                          <div style={{display:"flex",gap:"8px"}}>
                            <button className="adm-btn-secondary" style={{padding:"7px 14px",fontSize:"12px"}} onClick={()=>handleEdit(p)}>✏️ Edit</button>
                            <button className="adm-btn-danger" onClick={()=>handleDelete(p)}>🗑 Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}</tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminPage;
