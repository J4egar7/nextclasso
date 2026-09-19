function PrivacyPolicyPage() {
  return (
    <div className="page page-enter legal-page">
      <h1>Privacy Policy</h1>
      <p className="legal-updated">Last updated: September 2026</p>

      <p>
        This Privacy Policy explains what personal information CLASO ("we", "us", "our")
        collects through classo-topaz.vercel.app (the "Site"), why we collect it, how it is
        stored, and the choices and rights you have. It is written to comply with Pakistan's
        applicable legal framework, including the Electronic Transactions Ordinance, 2002
        (which gives electronic records and communications legal recognition), the Prevention
        of Electronic Crimes Act, 2016 ("PECA"), and applicable provincial Consumer Protection
        laws. Pakistan does not yet have a single, dedicated data protection statute in force
        (a Personal Data Protection Bill has been under consideration), so we also follow
        internationally recognised good-practice standards for handling customer data.
      </p>

      <h2>1. Information we collect</h2>
      <ul>
        <li><strong>Order &amp; contact information:</strong> your name, phone number, delivery address, and the items you order, collected when you check out.</li>
        <li><strong>Communications:</strong> messages you send us (e.g. by phone or WhatsApp) to confirm or discuss an order.</li>
        <li><strong>Admin accounts:</strong> store staff who manage products and orders authenticate with their own credentials via Supabase Auth; we do not store admin passwords in plain text.</li>
        <li><strong>Technical &amp; usage data:</strong> standard data such as IP address, browser/device type, and pages visited, collected automatically by our hosting provider (Vercel) for security, abuse-prevention, and performance purposes.</li>
        <li><strong>Cart/session data:</strong> stored locally in your browser so your cart persists between visits on the same device.</li>
      </ul>
      <p>
        We do not collect payment card, bank, or wallet details through the Site. CLASO
        currently operates on a cash-on-delivery (COD) basis, so no financial account
        information passes through or is stored by the Site.
      </p>

      <h2>2. Why we collect it (purpose &amp; legal basis)</h2>
      <ul>
        <li>To process, confirm, and deliver your order — the core purpose for which the data is provided to us.</li>
        <li>To contact you about an order, including manual confirmation calls in place of automated OTP verification.</li>
        <li>To detect, prevent, and investigate fraud, abuse, or security incidents.</li>
        <li>To keep records required for accounting, tax, and dispute-handling purposes.</li>
        <li>To maintain and improve the Site's performance and reliability.</li>
      </ul>
      <p>We collect only what is reasonably necessary for these purposes, and we do not use your order data for unrelated advertising or sell it to third parties.</p>

      <h2>3. Who we share information with</h2>
      <p>Your information is shared only where necessary to run the business, specifically with:</p>
      <ul>
        <li><strong>Delivery/courier partners</strong> — your name, phone number, and address, solely to deliver your order.</li>
        <li><strong>Infrastructure providers</strong> — Supabase (database and file storage) and Vercel (hosting), who process data on our behalf under their own security and data-processing terms. These providers may store or process data on servers located outside Pakistan; by using the Site you consent to this cross-border processing, which is used only to operate the Site and never sold onward.</li>
        <li><strong>Legal &amp; regulatory authorities</strong> — where required by Pakistani law, court order, or a lawful request from an authority such as the Federal Investigation Agency's Cybercrime wing under PECA.</li>
      </ul>
      <p>We do not share your personal data with third parties for their own marketing purposes.</p>

      <h2>4. Order confirmation without OTP</h2>
      <p>
        Orders are confirmed manually by our team, typically by phone, rather than through an
        automated OTP/SMS verification step. Your phone number is used solely for order
        confirmation and delivery coordination, and is not used to send marketing messages
        unless you separately opt in.
      </p>

      <h2>5. Data storage &amp; security</h2>
      <p>
        Order and product data is stored with Supabase, protected by row-level security (RLS)
        policies so that only authenticated, authorized admin accounts can access order
        records. Product images are stored in Supabase Storage. Our Site also applies standard
        security headers (e.g. against clickjacking and content-type sniffing) at the
        infrastructure level. While we take reasonable technical and organizational measures
        to protect your data, no method of transmission or storage over the internet can be
        guaranteed 100% secure. If we become aware of a data breach that poses a real risk to
        you, we will take reasonable steps to notify affected customers and address it without
        undue delay.
      </p>

      <h2>6. Data retention</h2>
      <p>
        We retain order and customer records for as long as reasonably needed to fulfil
        orders, handle returns, warranty, or disputes, and to meet tax and recordkeeping
        obligations under Pakistani law. When data is no longer needed for these purposes, we
        take reasonable steps to delete or anonymize it.
      </p>

      <h2>7. Your rights &amp; choices</h2>
      <p>You may contact us at any time to:</p>
      <ul>
        <li>Ask what personal information we hold about you</li>
        <li>Ask us to correct inaccurate information</li>
        <li>Ask us to delete your information, subject to any legal or accounting retention requirements</li>
        <li>Withdraw consent to non-essential communications (e.g. opt out of promotional messages)</li>
      </ul>
      <p>We will respond to any such request as soon as reasonably possible.</p>

      <h2>8. Children's privacy</h2>
      <p>
        The Site is intended for use by adults capable of entering into a binding contract
        under Pakistani law. We do not knowingly collect personal information from children.
        If you believe a minor has provided us with personal information, please contact us so
        we can remove it.
      </p>

      <h2>9. Cookies &amp; local storage</h2>
      <p>
        The Site may use basic cookies or browser local storage to keep your cart contents
        between visits. These are strictly functional — we do not currently use third-party
        advertising or cross-site tracking cookies.
      </p>

      <h2>10. International visitors</h2>
      <p>
        The Site is operated for customers in Pakistan. If you access the Site from outside
        Pakistan, you do so on your own initiative and are responsible for compliance with any
        local laws that may apply to you.
      </p>

      <h2>11. Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time, including to reflect changes in
        Pakistani law (such as any future data protection legislation). Changes will be posted
        on this page with an updated "Last updated" date, and continued use of the Site after
        changes are posted means you accept the updated policy.
      </p>

      <h2>12. Governing law</h2>
      <p>This Privacy Policy is governed by the laws of the Islamic Republic of Pakistan.</p>

      <h2>13. Contact us</h2>
      <p>
        Questions about this policy, or to exercise any of the rights above, contact us at{" "}
        <a href="mailto:support@claso.pk">support@claso.pk</a> [replace with your real support
        email/phone].
      </p>
    </div>
  );
}

export default PrivacyPolicyPage;
