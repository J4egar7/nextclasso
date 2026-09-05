import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase.js";

// No credentials live in this file anymore.
// Admin status is decided server-side by Firestore: a user is an admin
// only if a document exists at admins/{their-auth-uid}. Set that up
// once in the Firebase console (see README-ADMIN-SETUP.md).
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
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const adminSnap = await getDoc(doc(db, "admins", credential.user.uid));

      if (!adminSnap.exists()) {
        await auth.signOut();
        setError("This account is not authorised for admin access.");
        setLoading(false);
        return;
      }

      setUser({ name: "Admin", email: credential.user.email, uid: credential.user.uid, isAdmin: true });
      setPage("admin");
    } catch (e) {
      if (e.code === "auth/wrong-password" || e.code === "auth/invalid-credential") {
        setError("Invalid credentials. Please try again.");
      } else if (e.code === "auth/user-not-found") {
        setError("Invalid credentials. Please try again.");
      } else if (e.code === "auth/too-many-requests") {
        setError("Too many attempts. Please wait a few minutes and try again.");
      } else {
        setError("Something went wrong: " + e.message);
      }
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
