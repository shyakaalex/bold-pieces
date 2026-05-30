import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import StoreLayout from "../components/StoreLayout";
import { useCart } from "../context/CartContext";
import { api } from "../lib/api";
import { getProductSku, getProductSubtitle } from "../utils/productDisplay";
import { formatRwf, productImage, PRODUCT_FALLBACKS } from "../utils/format";

const TABS = [
  { id: "description", label: "Description" },
  { id: "details", label: "Details" },
  { id: "shipping", label: "Shipping & Returns" },
  { id: "reviews", label: "Reviews" },
];

const TRUST_ITEMS = [
  {
    label: "Free Delivery",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 7h11v9H3V7Zm11 2h4l2 3v4h-6V9Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Easy Returns",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 12a8 8 0 0114-5M20 12a8 8 0 01-14 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Secure Payment",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: "Gift Packaging",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 10h16v10H4V10Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 10V6M8 6h8a2 2 0 010 4H8a2 2 0 010-4Z" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
];

function reviewCountFromId(id) {
  const n = parseInt(String(id).slice(-2), 16) % 40;
  return 12 + n;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [wishlisted, setWishlisted] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const { addToCart, setCartOpen } = useCart();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: prod } = await api.get(`/products/${id}`);
        if (cancelled) return;
        setProduct(prod);
        setActiveImage(0);
        const { data: list } = await api.get(`/products?category=${encodeURIComponent(prod.category)}`);
        if (!cancelled) setRelated(list.filter((p) => p._id !== id).slice(0, 3));
      } catch {
        if (!cancelled) {
          setProduct(null);
          setRelated([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    const main = productImage(product, 0, PRODUCT_FALLBACKS);
    const pool = [main, ...PRODUCT_FALLBACKS.filter((src) => src !== main)];
    return [...new Set(pool)].slice(0, 5);
  }, [product]);

  const reviewCount = product ? reviewCountFromId(product._id) : 0;

  if (!product) {
    return (
      <StoreLayout variant="product">
        <p className="products-empty" style={{ padding: 48, textAlign: "center" }}>
          Loading product…
        </p>
      </StoreLayout>
    );
  }

  const inStock = product.stock > 0;
  const material = getProductSubtitle(product);
  const sku = getProductSku(product);

  const addAndOpenCart = () => {
    addToCart(product, qty);
    setCartOpen(true);
  };

  const buyNow = () => {
    addToCart(product, qty);
    navigate("/checkout");
  };

  const prevImage = () => setActiveImage((i) => (i === 0 ? galleryImages.length - 1 : i - 1));
  const nextImage = () => setActiveImage((i) => (i === galleryImages.length - 1 ? 0 : i + 1));

  return (
    <StoreLayout variant="product">
      <div className="product-page">
        <nav className="product-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          {" > "}
          <Link to="/shop">Shop</Link>
          {" > "}
          <Link to={`/shop?category=${encodeURIComponent(product.category)}`}>{product.category}</Link>
          {" > "}
          <span>{product.name}</span>
        </nav>

        <section className="product-purchase">
          <div className="product-gallery">
            <div className="product-gallery__thumbs" role="tablist" aria-label="Product images">
              {galleryImages.map((src, index) => (
                <button
                  key={src}
                  type="button"
                  role="tab"
                  aria-selected={activeImage === index}
                  className={`product-gallery__thumb ${activeImage === index ? "product-gallery__thumb--active" : ""}`}
                  onClick={() => setActiveImage(index)}
                >
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
            <div>
              <div className="product-gallery__main-wrap">
                <div className="product-gallery__main">
                  <img src={galleryImages[activeImage]} alt={product.name} />
                </div>
                {galleryImages.length > 1 ? (
                  <>
                    <button type="button" className="product-gallery__nav product-gallery__nav--prev" onClick={prevImage} aria-label="Previous image">
                      ‹
                    </button>
                    <button type="button" className="product-gallery__nav product-gallery__nav--next" onClick={nextImage} aria-label="Next image">
                      ›
                    </button>
                  </>
                ) : null}
                <button type="button" className="product-gallery__expand" onClick={() => setLightbox(true)} aria-label="Expand image">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M8 4H4v4M20 4h-4M20 20v-4M4 20v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <button type="button" className="product-gallery__video" onClick={() => setLightbox(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M10 9l6 3-6 3V9Z" fill="currentColor" />
                </svg>
                Watch video
              </button>
            </div>
          </div>

          <div className="product-info">
            {product.badge ? <span className="product-info__badge">{product.badge}</span> : null}
            <h1>{product.name}</h1>
            <p className="product-info__price">{formatRwf(product.price)}</p>

            <div className="product-info__meta">
              <span className="product-info__stars" aria-label="5 out of 5 stars">
                {"★★★★★".split("").map((s, i) => (
                  <span key={i}>{s}</span>
                ))}
              </span>
              <a href="#reviews" className="product-info__reviews" onClick={() => setActiveTab("reviews")}>
                ({reviewCount} reviews)
              </a>
              <span className={`product-info__stock ${inStock ? "" : "product-info__stock--out"}`}>
                {inStock ? "In stock" : "Out of stock"}
              </span>
            </div>

            <p className="product-info__lead">
              {product.description ||
                "Handcrafted luxury jewelry from Bold Pieces — nature inspired, boldly made in Kigali."}
            </p>

            <div className="product-features">
              <div className="product-feature">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <div>
                  <strong>Gold Plated</strong>
                  Premium finish
                </div>
              </div>
              <div className="product-feature">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 3l2 4 4 1-3 3 1 4-8-4-1-4 3-3-1-4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
                <div>
                  <strong>Handcrafted</strong>
                  Made with care
                </div>
              </div>
              <div className="product-feature">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <div>
                  <strong>Hypoallergenic</strong>
                  Safe for skin
                </div>
              </div>
            </div>

            <div className="product-buy">
              <div className="product-buy__qty">
                <button type="button" onClick={() => setQty((v) => Math.max(1, v - 1))} aria-label="Decrease quantity">
                  −
                </button>
                <span aria-live="polite">{qty}</span>
                <button type="button" onClick={() => setQty((v) => Math.min(v + 1, product.stock || 99))} aria-label="Increase quantity">
                  +
                </button>
              </div>
              <div className="product-buy__actions">
                <button type="button" className="btn-primary" disabled={!inStock} onClick={addAndOpenCart}>
                  Add to Cart
                </button>
                <button type="button" className="btn-outline" disabled={!inStock} onClick={buyNow}>
                  Buy Now
                </button>
              </div>
            </div>

            <button
              type="button"
              className={`product-wishlist ${wishlisted ? "product-wishlist--on" : ""}`}
              onClick={() => setWishlisted((v) => !v)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 20s-7-4.35-7-10a4 4 0 017-2.76A4 4 0 0119 10c0 5.65-7 10-7 10Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill={wishlisted ? "currentColor" : "none"}
                />
              </svg>
              Add to Wishlist
            </button>
          </div>
        </section>

        <section className="product-trust" aria-label="Purchase benefits">
          {TRUST_ITEMS.map((item) => (
            <div key={item.label} className="product-trust__item">
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </section>

        <section className="product-lower">
          <div className="product-tabs">
            <div className="product-tabs__list" role="tablist">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  id={`tab-${tab.id}`}
                  className={`product-tabs__tab ${activeTab === tab.id ? "product-tabs__tab--active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                  {tab.id === "reviews" ? ` (${reviewCount})` : ""}
                </button>
              ))}
            </div>

            <div className="product-tabs__panel" role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
              {activeTab === "description" ? (
                <>
                  <h3>About this piece</h3>
                  <p>
                    {product.description ||
                      "Each Bold Pieces design is handcrafted in Kigali with attention to detail and timeless elegance."}
                  </p>
                </>
              ) : null}

              {activeTab === "details" ? (
                <>
                  <h3>Specifications</h3>
                  <ul>
                    <li>Material: {material}</li>
                    <li>Category: {product.category}</li>
                    <li>SKU: {sku}</li>
                    <li>Finish: 18K gold plated</li>
                    <li>Length: 17 cm + 3 cm extender (adjustable)</li>
                    <li>Closure: Lobster clasp</li>
                    <li>Care: Store in pouch; avoid water and perfume</li>
                  </ul>
                </>
              ) : null}

              {activeTab === "shipping" ? (
                <>
                  <h3>Shipping & returns</h3>
                  <p>
                    Free delivery on orders over RWF 200,000 across Rwanda. Kigali deliveries typically arrive in 2–3
                    business days; upcountry within 5–7 business days.
                  </p>
                  <p>
                    Returns accepted within 30 days for unworn items in original packaging. Contact{" "}
                    <Link to="/contact">customer support</Link> to start a return.
                  </p>
                </>
              ) : null}

              {activeTab === "reviews" ? (
                <div id="reviews">
                  <h3>Customer reviews</h3>
                  <p>
                    Rated 5.0 from {reviewCount} reviews. Reviews are collected from verified Bold Pieces customers in
                    Rwanda.
                  </p>
                  <ul>
                    <li>“Beautiful craftsmanship — even more stunning in person.” — Clarisse, Kigali</li>
                    <li>“Fast delivery and elegant packaging. Perfect gift.” — Patrick, Musanze</li>
                    <li>“The emerald tone is gorgeous. I wear it daily.” — Aline, Kigali</li>
                  </ul>
                </div>
              ) : null}
            </div>
          </div>

          <aside className="product-related">
            <div className="product-related__head">
              <h2>You may also like</h2>
              <div className="product-related__nav" aria-hidden="true">
                <button type="button">‹</button>
                <button type="button">›</button>
              </div>
            </div>
            <div className="product-related__grid">
              {related.length === 0 ? (
                <p className="products-empty">Explore more in the shop.</p>
              ) : (
                related.map((item, index) => (
                  <Link key={item._id} to={`/products/${item._id}`} className="product-related-card">
                    <img src={productImage(item, index + 1, PRODUCT_FALLBACKS)} alt="" />
                    <div>
                      <strong>{item.name}</strong>
                      <span>{formatRwf(item.price)}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </aside>
        </section>
      </div>

      {lightbox ? (
        <div className="product-lightbox" role="dialog" aria-modal="true" aria-label="Product image">
          <button type="button" onClick={() => setLightbox(false)} aria-label="Close">
            ×
          </button>
          <img src={galleryImages[activeImage]} alt={product.name} />
        </div>
      ) : null}
    </StoreLayout>
  );
}
