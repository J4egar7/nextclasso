import { CONTACT } from "../data/contact.js";

function ReturnsPage({ setPage }) {
  return (
    <div className="page page-enter legal-page">
      <h1>Returns &amp; Refunds</h1>
      <p className="legal-updated">Last updated: October 2026</p>

      <p>
        We want you to be happy with everything you order from CLASO. Because beauty products
        are personal-care items, our returns approach is built around safety and hygiene while
        still protecting you if something goes wrong with your order.
      </p>

      <h2>What we will make right</h2>
      <p>Contact us and we will arrange a replacement or refund if your item:</p>
      <ul>
        <li>arrives damaged or leaking,</li>
        <li>is not the product you ordered, or</li>
        <li>is not as described on the product page.</li>
      </ul>

      <h2>What we cannot accept back</h2>
      <p>
        For hygiene reasons, we generally cannot accept returns of products that have been
        opened or used, unless the item is faulty, damaged, or misdescribed. Please also do not
        send anything back before speaking to us.
      </p>

      <h2>How to start a return</h2>
      <ul>
        <li>Contact us as soon as possible after your order arrives.</li>
        <li>Tell us your name, the phone number used on the order, and which item has the problem.</li>
        <li>Include clear photos of the product and its packaging, especially for damaged or incorrect items.</li>
      </ul>
      <p>
        Email us at <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> or visit
        our <span className="legal-link" onClick={() => setPage("contact")}>Contact page</span>.
        We will review your request and reply with the next steps.
      </p>

      <h2>Refunds</h2>
      <p>
        CLASO operates on cash on delivery, so we do not hold any card or bank details. If a
        refund is approved, our team will agree the refund method with you directly.
      </p>

      <h2>Allergic reactions</h2>
      <p>
        We recommend patch testing every product before first use. If you have a reaction,
        stop using the product and seek advice from a doctor or pharmacist. You can read our
        full patch-test guidance in the{" "}
        <span className="legal-link" onClick={() => setPage("terms")}>Terms of Service</span>.
      </p>

      <p>
        This page is a summary. If anything here differs from our Terms of Service, the Terms
        of Service apply.
      </p>
    </div>
  );
}

export default ReturnsPage;
