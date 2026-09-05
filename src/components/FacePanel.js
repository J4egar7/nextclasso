import { useState } from "react";

function FacePanel({ products }) {
  const [active, setActive] = useState(0);
  // Placeholder face images — replace with real model/AI images later
  const facePlaceholders = [
    { label: products[0]?.name || "Product 1", color: products[0]?.bg || "linear-gradient(135deg,#FFD6E7,#FFACC7)", emoji: products[0]?.emoji || "🌸" },
    { label: products[1]?.name || "Product 2", color: products[1]?.bg || "linear-gradient(135deg,#D4F5E9,#A8E6CF)", emoji: products[1]?.emoji || "🌿" },
    { label: products[2]?.name || "Product 3", color: products[2]?.bg || "linear-gradient(135deg,#FFE0CC,#FFAB73)", emoji: products[2]?.emoji || "✨" },
    { label: products[3]?.name || "Product 4", color: products[3]?.bg || "linear-gradient(135deg,#F8C8D4,#F4A0B5)", emoji: products[3]?.emoji || "💄" },
  ];
  const current = facePlaceholders[active];
  return (
    <div className="face-panel">
      <div className="face-panel-label">See it on skin ✦</div>
      <div className="face-panel-main" style={{ background: current.color }}>
        {/* Placeholder — swap with <img src="..."> when you have model photos */}
        <div className="face-panel-placeholder">
          <div style={{fontSize:"96px", marginBottom:"12px"}}>{current.emoji}</div>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:600,color:"rgba(0,0,0,0.5)",letterSpacing:"1px",textTransform:"uppercase"}}>Model photo</div>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"rgba(0,0,0,0.35)",marginTop:"4px"}}>coming soon</div>
        </div>
        <div className="face-panel-overlay-tag">{current.label}</div>
      </div>
      {/* Thumbnail strip */}
      <div className="face-panel-thumbs">
        {facePlaceholders.map((fp, i) => (
          <button
            key={i}
            className={`face-thumb ${active === i ? "face-thumb-active" : ""}`}
            onClick={() => setActive(i)}
            style={{ background: fp.color }}
          >
            <span style={{fontSize:"24px"}}>{fp.emoji}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default FacePanel;
