const FAQS = [
  {
    q: "Are your products authentic?",
    a: "Yes. Every product is sourced directly from brands or authorised distributors. CLASO is a retailer, so the products are made by their respective brands and sold by us.",
  },
  {
    q: "How do I pay?",
    a: "CLASO currently works on cash on delivery. We do not collect card, bank or wallet details on the site.",
  },
  {
    q: "Do I need an account to order?",
    a: "No. Add items to your cart, go to checkout, and enter your name, phone number and address.",
  },
  {
    q: "Why does your team call to confirm my order?",
    a: "We confirm orders manually by phone instead of using automated OTP codes. Your phone number is only used for confirming and coordinating your order.",
  },
  {
    q: "Where can I see my recent orders?",
    a: "Orders placed from this device appear on the Your Orders page, which you can open from the Saved panel.",
  },
  {
    q: "Should I patch test products?",
    a: "Yes. Apply a small amount to your inner forearm and wait 24 to 48 hours before using a new product on your face or sensitive areas. Always check the ingredient list on the packaging as well.",
  },
  {
    q: "What if my item is damaged or not what I ordered?",
    a: "Contact us with your order details and photos. We will arrange a replacement or refund. See our Returns page for the full details.",
    link: "returns",
    linkLabel: "Read the Returns page",
  },
  {
    q: "How can I contact CLASO?",
    a: "Email us or visit the Contact page. Please include the name and phone number used on your order.",
    link: "contact",
    linkLabel: "Go to the Contact page",
  },
];

function FaqPage({ setPage }) {
  return (
    <div className="page page-enter legal-page">
      <h1>Frequently Asked Questions</h1>
      <p className="legal-updated">Quick answers about shopping with CLASO.</p>

      <div className="faq-list">
        {FAQS.map(item => (
          <details key={item.q} className="faq-item">
            <summary>{item.q}</summary>
            <p>{item.a}</p>
            {item.link && (
              <p><span className="legal-link" onClick={() => setPage(item.link)}>{item.linkLabel}</span></p>
            )}
          </details>
        ))}
      </div>
    </div>
  );
}

export default FaqPage;
