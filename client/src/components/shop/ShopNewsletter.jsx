import { useState } from "react";

import { api } from "../../lib/api";

export default function ShopNewsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("");
    try {
      await api.post("/newsletter", { email });
      setStatus("Thanks — you're on the list.");
      setEmail("");
    } catch {
      setStatus("Something went wrong. Please try again.");
    }
  };

  return (
    <section className="shop-newsletter" aria-labelledby="shop-newsletter-title">
      <div className="shop-newsletter__icon" aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="shop-newsletter__copy">
        <h2 id="shop-newsletter-title">Join the Bold Pieces community</h2>
        <p>Be the first to discover new collections and exclusive offers.</p>
      </div>
      <form className="shop-newsletter__form" onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          aria-label="Email address"
        />
        <button type="submit" className="btn-primary">
          Subscribe
        </button>
      </form>
      {status ? <p className="shop-newsletter__status">{status}</p> : null}
    </section>
  );
}
