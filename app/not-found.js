"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "100px 24px",
        fontFamily: "var(--font-dmsans), sans-serif",
      }}
    >
      <div style={{ fontSize: "72px", marginBottom: "8px" }}>💄</div>
      <h1
        style={{
          fontFamily: "var(--font-playfair), serif",
          fontSize: "clamp(32px, 5vw, 48px)",
          color: "var(--about-dark)",
          marginBottom: "12px",
        }}
      >
        Page not found
      </h1>
      <p style={{ color: "#555", maxWidth: "420px", marginBottom: "32px", lineHeight: 1.6 }}>
        The page you're looking for doesn't exist, may have moved, or the link might be
        incorrect.
      </p>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
        <Link
          href="/"
          style={{
            padding: "12px 28px",
            borderRadius: "999px",
            background: "var(--about-primary)",
            color: "#fff",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Back to Home
        </Link>
        <Link
          href="/skincare"
          style={{
            padding: "12px 28px",
            borderRadius: "999px",
            border: "1px solid var(--about-primary)",
            color: "var(--about-primary)",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Shop Skincare
        </Link>
      </div>
    </div>
  );
}
