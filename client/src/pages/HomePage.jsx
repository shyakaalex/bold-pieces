import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import HomeTrustBar from "../components/HomeTrustBar";
import ProductCard from "../components/ProductCard";
import StoreLayout from "../components/StoreLayout";
import "../styles/featured-products.css";
import "../styles/home-trust.css";
import { useCart } from "../context/CartContext";
import { api } from "../lib/api";
import { CATEGORIES, formatRwf, productImage, PRODUCT_FALLBACKS } from "../utils/format";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [modal, setModal] = useState(null);
  const [email, setEmail] = useState("");
  const { addToCart, setCartOpen } = useCart();

  useEffect(() => {
    const query = activeFilter === "All" ? "" : `?category=${encodeURIComponent(activeFilter)}`;
    api.get(`/products${query}`).then((r) => setProducts(r.data)).catch(() => setProducts([]));
  }, [activeFilter]);

  const handleSubscribe = async (event) => {
    event.preventDefault();
    await api.post("/newsletter", { email });
    setEmail("");
  };

  return (
    <StoreLayout>
      <section className="hero">
        <div className="hero-copy">
          <h1>
            Crafted for <em>Bold Elegance.</em>
          </h1>
          <p>
            Timeless jewelry inspired by nature.
            <br />
            Made to shine with you, every day.
          </p>
          <Link to="/shop" className="primary-btn">
            SHOP COLLECTION <span>-&gt;</span>
          </Link>
        </div>
        <div className="hero-media">
          <div className="seal">NATURE INSPIRED * BOLDLY MADE</div>
        </div>
      </section>

      <HomeTrustBar />

      <section className="section-head">
        <h3>FEATURED PIECES</h3>
        <Link to="/shop">VIEW ALL -&gt;</Link>
      </section>
      <section className="filters">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            className={`chip ${activeFilter === category ? "active" : ""}`}
            onClick={() => setActiveFilter(category)}
          >
            {category}
          </button>
        ))}
      </section>
      <section className="products products--featured" aria-label="Featured pieces">
        {products.length === 0 ? (
          <p className="products-empty">Loading featured pieces…</p>
        ) : (
          products.map((product, index) => (
            <ProductCard key={product._id} product={product} index={index} onQuickView={setModal} />
          ))
        )}
      </section>

      <section className="story">
        <div className="story-image" />
        <div className="story-copy">
          <small>OUR STORY</small>
          <h2>
            Inspired by Nature.
            <br />
            Made for You.
          </h2>
          <p>
            Bold Pieces celebrates the raw beauty of nature through timeless design and exceptional
            craftsmanship.
          </p>
          <Link to="/about">LEARN MORE -&gt;</Link>
        </div>
      </section>

      <section className="newsletter">
        <div className="newsletter-title">
          <p>Be the first to discover</p>
          <h3>New Collections.</h3>
          <img src="/assets/icons/Maroon initials.png" alt="BP monogram" className="mono-mark" />
        </div>
        <form className="newsletter-form" onSubmit={handleSubscribe}>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Enter your email" required />
          <button type="submit">JOIN THE LIST</button>
        </form>
      </section>

      <div className={`modal ${modal ? "open" : ""}`} onClick={(e) => e.target.classList.contains("modal") && setModal(null)}>
        {modal ? (
          <div className="modal-card">
            <button type="button" className="modal-close" onClick={() => setModal(null)}>
              X
            </button>
            <div className="thumb modal-thumb" style={{ backgroundImage: `url('${productImage(modal, 0, PRODUCT_FALLBACKS)}')` }} />
            <h3>{modal.name}</h3>
            <p>{formatRwf(modal.price)}</p>
            <p className="modal-copy">
              A symbol of elegance and strength. {modal.name} features refined craftsmanship in 14k gold.
            </p>
            <button
              type="button"
              className="primary-btn"
              onClick={() => {
                addToCart(modal);
                setModal(null);
                setCartOpen(true);
              }}
            >
              ADD TO CART
            </button>
          </div>
        ) : null}
      </div>
    </StoreLayout>
  );
}
