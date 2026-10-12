"use client";

import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "100px 24px" }}>
      <div style={{ fontSize: "64px", marginBottom: "8px" }}>🌸</div>
      <h1 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "clamp(28px, 5vw, 40px)", marginBottom: "12px" }}>Something went wrong</h1>
      <p style={{ color: "#555", maxWidth: "420px", marginBottom: "28px", lineHeight: 1.6 }}>
        We hit an unexpected problem loading this page. Please try again, and if it keeps happening, contact us.
      </p>
      <button className="btn-primary" onClick={() => reset()}>Try again</button>
    </div>
  );
}
