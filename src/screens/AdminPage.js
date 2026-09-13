import { useState, useEffect } from "react";
import { WEIGHT_UNITS, CATEGORIES } from "../data/constants.js";
import { supabase } from "../lib/supabase.js";

const blankForm = { name:"", brand:"", category:"Skincare", price:"", stock:"", description:"", weight:"", weightUnit:"g", images:[] };

// DB rows are snake_case; the admin form/table use camelCase — same
// mapping as StoreContext.js.
function mapRowToProduct(row) {
  return {
    id: row.id, name: row.name, brand: row.brand, category: row.category,
    price: row.price, priceNum: row.price_num, stock: row.stock,
    description: row.description, weight: row.weight, weightUnit: row.weight_unit,
    images: row.images || [],
  };
}

function AdminPage({ setPage, user, setUser }) {
  const [view, setView] = useState("dashboard");
  const [form, setForm] = useState(blankForm);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Live-sync the product catalogue from Supabase — this is the single
  // source of truth the storefront also reads from. Admin queries can
  // select every column (including manufacturing_cost); the public
  // storefront query in StoreContext.js deliberately doesn't.
  useEffect(() => {
    const load = () => {
      supabase.from("products").select("*").order("created_at", { ascending: false }).then(({ data, error }) => {
        if (error) { console.error(error); setLoadingProducts(false); return; }
        setProducts((data || []).map(mapRowToProduct));
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

  // Redirect to login if not an authenticated admin. Done in an effect
  // (not during render) since setPage triggers real navigation now.
  useEffect(() => {
    if (!user?.isAdmin) setPage("admin-login");
  }, [user, setPage]);

  if (!user?.isAdmin) return null;

  const setField = (k,v) => setForm(f => ({...f, [k]:v}));

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => setForm(f => ({ ...f, images: [...f.images, ev.target.result] }));
      reader.readAsDataURL(file);
    });
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

      const payload = {
        name: form.name.trim(),
        brand: form.brand.trim(),
        category: form.category,
        price: form.price.trim(),
        price_num: parseInt(form.price.replace(/[^0-9]/g, "")) || 0,
        stock: parseInt(form.stock) || 0,
        description: form.description.trim(),
        weight: form.weight,
        weight_unit: form.weightUnit,
        images: uploadedUrls,
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
    setForm({ name:p.name, brand:p.brand, category:p.category, price:p.price, stock:String(p.stock), description:p.description, weight:p.weight||"", weightUnit:p.weightUnit||"g", images:p.images || [] });
    setEditId(p.id);
    setView("add");
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
          <button className="adm-nav-item" onClick={() => { setUser(null); setPage("home"); }}>
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
                  { icon:"📦", val: products.length, label:"Total Products" },
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
                              {p.images?.[0] ? <img src={p.images[0]} alt="" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"10px"}} /> : "🛍️"}
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
                  <div className="adm-field span-2">
                    <label className="adm-field-label">Description</label>
                    <textarea className="adm-textarea" placeholder="Write a short product description…" value={form.description} onChange={e=>setField("description",e.target.value)} />
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
                      <th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Weight</th><th>Actions</th>
                    </tr></thead>
                    <tbody>{products.map(p => (
                      <tr key={p.id}>
                        <td>
                          <div className="adm-product-info">
                            <div className="adm-product-thumb">
                              {p.images?.[0] ? <img src={p.images[0]} alt="" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"10px"}} /> : "🛍️"}
                            </div>
                            <div>
                              <div className="adm-product-name">{p.name}</div>
                              <div className="adm-product-brand">{p.brand || "—"}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{color:"var(--adm-muted)",fontSize:"13px"}}>{p.category}</td>
                        <td style={{fontWeight:600}}>{p.price}</td>
                        <td><span className={`adm-stock-badge ${stockBadge(p.stock)}`}>{stockLabel(p.stock)}</span></td>
                        <td style={{color:"var(--adm-muted)",fontSize:"13px"}}>{p.weight ? `${p.weight} ${p.weightUnit}` : "—"}</td>
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
