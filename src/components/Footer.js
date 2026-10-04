const SHOP_LINKS = [
  { label: "Skincare",   page: "skincare"   },
  { label: "Makeup",     page: "makeup"     },
  { label: "Fragrances", page: "fragrances" },
  { label: "Hair Care",  page: "hair-care"  },
];

const HELP_LINKS = [
  { label: "Returns",    page: "returns" },
  { label: "Contact Us", page: "contact" },
  { label: "FAQ",        page: "faq"     },
];

const ABOUT_LINKS = [
  { label: "Our Story", page: "about" },
];

function Footer({ setPage }) {
  const renderLinks = (links) => links.map(l => (
    <li key={l.label} onClick={() => setPage(l.page)}>{l.label}</li>
  ));

  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <div className="footer-logo">CLASO</div>
          <p className="footer-tagline">Pakistan's most loved destination for authentic beauty. Serving 15,000+ happy customers since 2021.</p>
        </div>
        <div>
          <div className="footer-heading">Shop</div>
          <ul className="footer-links">{renderLinks(SHOP_LINKS)}</ul>
        </div>
        <div>
          <div className="footer-heading">Help</div>
          <ul className="footer-links">{renderLinks(HELP_LINKS)}</ul>
        </div>
        <div>
          <div className="footer-heading">About</div>
          <ul className="footer-links">{renderLinks(ABOUT_LINKS)}</ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div>
          <div className="footer-copy">© 2026 CLASO. All rights reserved. Made with 💄 in Pakistan.</div>
          <div className="footer-legal">
            <span onClick={() => setPage("privacy")}>Privacy Policy</span>
            <span onClick={() => setPage("terms")}>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
