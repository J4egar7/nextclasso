
function Footer({ setPage, goToProducts }) {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <div className="footer-logo">CLASO</div>
          <p className="footer-tagline">Pakistan's most loved destination for authentic beauty. Serving 15,000+ happy customers since 2021.</p>
          <div style={{ marginTop: "24px", display: "flex", gap: "8px" }}>
            {["🌸","✨","💄","🌿"].map((e,i) => (
              <div key={i} style={{ width:"36px", height:"36px", borderRadius:"50%", background:"rgba(255,255,255,0.05)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px", cursor:"pointer" }}>{e}</div>
            ))}
          </div>
        </div>
        <div>
          <div className="footer-heading">Shop</div>
          <ul className="footer-links">
            {["Skincare","Makeup","K-Beauty","Fragrances","Hair Care","Travel Size"].map(l => (
              <li key={l} onClick={() => l === "Skincare" ? goToProducts("skincare") : l === "Makeup" ? goToProducts("makeup") : setPage("home")}>{l}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="footer-heading">Help</div>
          <ul className="footer-links">
            {["Track Order","Returns","Shipping Info","Product Guide","Contact Us","FAQ"].map(l => <li key={l}>{l}</li>)}
          </ul>
        </div>
        <div>
          <div className="footer-heading">About</div>
          <ul className="footer-links">
            {["Our Story","Blog","Press","Sustainability","Careers","Affiliate Program"].map(l => (
              <li key={l} onClick={() => setPage("about")}>{l}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-copy">© 2026 CLASO. All rights reserved. Made with 💄 in Pakistan.</div>
        <div className="footer-socials">
          {["📸","🎵","💬","🐦"].map((s,i) => (
            <div key={i} className="social-btn">{s}</div>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
