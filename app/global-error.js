"use client";

// Last-resort error page. It replaces the whole layout, so it carries its own
// <html> and <body> and uses no site styles.
export default function GlobalError({ reset }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0, background: "#FFF8F0", color: "#1a0a0a" }}>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "24px" }}>
          <h1 style={{ fontSize: "32px", marginBottom: "12px" }}>CLASO is having a moment</h1>
          <p style={{ color: "#555", maxWidth: "420px", marginBottom: "28px", lineHeight: 1.6 }}>
            Something went wrong on our side. Please refresh the page, or try again in a few minutes.
          </p>
          <button onClick={() => reset()} style={{ background: "#FF5E5B", color: "white", border: 0, borderRadius: "100px", padding: "14px 32px", fontSize: "15px", cursor: "pointer" }}>Try again</button>
        </div>
      </body>
    </html>
  );
}
