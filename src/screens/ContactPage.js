import { CONTACT } from "../data/contact.js";

function ContactPage({ setPage }) {
  return (
    <div className="page page-enter legal-page">
      <h1>Contact Us</h1>
      <p className="legal-updated">We are happy to help with orders, products and returns.</p>

      <div className="contact-grid">
        <div className="contact-card">
          <div className="contact-card-icon">✉️</div>
          <div className="contact-card-title">Email</div>
          <p>Best for order questions, returns and anything that needs photos.</p>
          <a className="contact-card-link" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
        </div>

        {CONTACT.whatsapp && (
          <div className="contact-card">
            <div className="contact-card-icon">💬</div>
            <div className="contact-card-title">WhatsApp</div>
            <p>Quick questions about products and orders.</p>
            <a className="contact-card-link" href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noopener noreferrer">Message us on WhatsApp</a>
          </div>
        )}
      </div>

      <h2>When you get in touch</h2>
      <ul>
        <li>Include the name and phone number used on your order.</li>
        <li>For a damaged or incorrect item, attach photos of the product and packaging.</li>
        <li>Check our <span className="legal-link" onClick={() => setPage("faq")}>FAQ</span> and{" "}
          <span className="legal-link" onClick={() => setPage("returns")}>Returns</span> pages, as they may answer your question straight away.</li>
      </ul>
    </div>
  );
}

export default ContactPage;
