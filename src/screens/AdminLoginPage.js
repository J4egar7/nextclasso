import { useState } from "react";
import { supabase } from "../lib/supabase.js";

// No credentials live in this file anymore.
// Admin status is decided server-side by Supabase: a user is an admin
// only if a row exists in the `admins` table with their auth user id.
// Set that up once in the Supabase dashboard — see SETUP-NOTES.md.
function AdminLoginPage({ setPage, setUser }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPw, setShowPw]     = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!email.trim() || !password) { setError("Please enter your email and password."); return; }

    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(), password,
      });

      if (authError) {
        if (authError.message.toLowerCase().includes("invalid login credentials")) {
          setError("Invalid credentials. Please try again.");
        } else if (authError.status === 429) {
          setError("Too many attempts. Please wait a few minutes and try again.");
        } else {
          setError("Something went wrong: " + authError.message);
        }
        setLoading(false);
        return;
      }

      const { data: adminRow } = await supabase
        .from("admins")
        .select("id")
        .eq("id", data.user.id)
        .maybeSingle();

      if (!adminRow) {
        await supabase.auth.signOut();
        setError("This account is not authorised for admin access.");
        setLoading(false);
        return;
      }

      setUser({ name: "Admin", email: data.user.email, uid: data.user.id, isAdmin: true });
      setPage("admin");
    } catch (e) {
      setError("Something went wrong: " + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="adm-login-page">
      <div className="adm-login-card">
        {/* Logo */}
        <div className="adm-login-logo">CLASO</div>
        <div className="adm-login-subtitle">Admin Portal</div>

        {/* Lock icon */}
        <div className="adm-login-icon">🔐</div>

        <div className="adm-login-title">Sign in to continue</div>
        <div className="adm-login-hint">Restricted area — authorised personnel only</div>

        {/* Fields */}
        <div className="adm-login-fields">
          <div className="adm-login-field">
            <label className="adm-login-label">Email address</label>
            <input
              className={`adm-login-input ${error ? "has-error" : ""}`}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              autoFocus
            />
          </div>

          <div className="adm-login-field">
            <label className="adm-login-label">Password</label>
            <div style={{ position: "relative" }}>
              <input
                className={`adm-login-input ${error ? "has-error" : ""}`}
                type={showPw ? "text" : "password"}
                placeholder="••••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                style={{ paddingRight: "48px" }}
              />
              <button
                className="adm-login-eye"
                onClick={() => setShowPw(v => !v)}
                tabIndex={-1}
                type="button"
              >
                {showPw ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {error && (
            <div className="adm-login-error">
              ⚠ {error}
            </div>
          )}

          <button
            className="adm-login-btn"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <span className="adm-login-spinner" />
            ) : (
              "Sign In →"
            )}
          </button>
        </div>

        <div className="adm-login-footer">
          <button className="adm-login-back" onClick={() => setPage("home")}>
            ← Back to store
          </button>
        </div>
      </div>

      {/* Ambient background blobs */}
      <div className="adm-login-blob blob-1" />
      <div className="adm-login-blob blob-2" />
    </div>
  );
}

export default AdminLoginPage;
