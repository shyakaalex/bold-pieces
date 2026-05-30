import { Link } from "react-router-dom";

import StoreLayout from "../components/StoreLayout";

function PageShell({ title, children }) {
  return (
    <StoreLayout>
      <section className="page-hero">
        <h1>{title}</h1>
        {children}
      </section>
    </StoreLayout>
  );
}

export function CollectionsPage() {
  return (
    <PageShell title="Collections">
      <p>Explore signature lines crafted for bold elegance.</p>
      <div className="content-links">
        <Link to="/shop?category=Necklaces">Necklaces</Link>
        <Link to="/shop?category=Bracelets">Bracelets</Link>
        <Link to="/shop?category=Earrings">Earrings</Link>
        <Link to="/shop?category=Rings">Rings</Link>
      </div>
    </PageShell>
  );
}

export function AboutPage() {
  return (
    <PageShell title="About Bold Pieces">
      <p>
        Bold Pieces is a Rwanda-based luxury jewelry brand celebrating nature-inspired design and
        exceptional craftsmanship. Each piece is made to shine with you, every day.
      </p>
    </PageShell>
  );
}

export function LookbookPage() {
  return (
    <PageShell title="Lookbook">
      <div className="lookbook-grid">
        {["jw11.png", "jw12.png", "jw13.png", "jw14.png", "jw15.png", "jw1.png"].map((file) => (
          <div key={file} className="lookbook-card" style={{ backgroundImage: `url('/assets/bestsellers/${file}'), url('/assets/products/${file}')` }} />
        ))}
      </div>
    </PageShell>
  );
}

export function ContactPage() {
  return (
    <PageShell title="Contact">
      <p>Email: hello@boldpieces.com</p>
      <p>Phone: +250 780 000 000</p>
      <p>Kigali, Rwanda</p>
    </PageShell>
  );
}
