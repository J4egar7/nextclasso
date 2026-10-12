import { useState } from "react";
import { supabase } from "../lib/supabase.js";

// Real newsletter sign-up: saves the email to the database through the
// subscribe_newsletter() function (see supabase-hardening.sql).
export default function NewsletterForm({ buttonLabel = "Subscribe", buttonStyle }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle"); // idle | sending | done
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setState("sending");
    const { error: err } = await supabase.rpc("subscribe_newsletter", { p_email: email });
    if (err) {
      const friendly = /valid email|too many sign-ups/i.test(err.message || "");
      setError(friendly ? err.message : "We couldn't sign you up just now. Please try again in a moment.");
      setState("idle");
      return;
    }
    setState("done");
  };

  if (state === "done") {
    return <div className="newsletter-done" role="status">✓ You're on the list. Thank you!</div>;
  }

  return (
    <form className="newsletter-form" onSubmit={submit} noValidate>
      <label htmlFor="newsletter-email" className="sr-only">Email address</label>
      <input
        id="newsletter-email"
        className="newsletter-input"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="your@email.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <button className="newsletter-btn" style={buttonStyle} type="submit" disabled={state === "sending" || !email.trim()}>
        {state === "sending" ? "Joining…" : buttonLabel}
      </button>
      {error && <div className="newsletter-error" role="alert">{error}</div>}
    </form>
  );
}
