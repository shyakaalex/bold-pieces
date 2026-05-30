import { Link } from "react-router-dom";

import { useCart } from "../context/CartContext";
import { formatRwf, productImage, PRODUCT_FALLBACKS } from "../utils/format";
import { getDisplayRating } from "../utils/productRating";

function badgeModifier(badge) {
  if (!badge) return "";
  const value = badge.toUpperCase();
  if (value.includes("BEST")) return "featured-card__badge--bestseller";
  if (value === "NEW") return "featured-card__badge--new";
  if (value.includes("LIMIT")) return "featured-card__badge--limited";
  return "featured-card__badge--default";
}

function StarRating({ stars, reviewCount }) {
  return (
    <div
      className="featured-card__rating"
      aria-label={`${stars} out of 5 stars, ${reviewCount} reviews`}
    >
      <span className="featured-card__stars" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((level) => (
          <span
            key={level}
            className={
              level <= stars
                ? "featured-card__star featured-card__star--on"
                : "featured-card__star"
            }
          >
            ★
          </span>
        ))}
      </span>
      <span className="featured-card__reviews">({reviewCount})</span>
    </div>
  );
}

export default function ProductCard({ product, index = 0, onQuickView }) {
  const { addToCart, setCartOpen } = useCart();
  const imageSrc = productImage(product, index, PRODUCT_FALLBACKS);
  const { stars, reviewCount } = getDisplayRating(product);

  const handleAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();
    addToCart(product);
    setCartOpen(true);
  };

  const handleQuickView = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onQuickView?.(product);
  };

  return (
    <article className="featured-card">
      <div className="featured-card__media-wrap">
        {product.badge ? (
          <span className={`featured-card__badge ${badgeModifier(product.badge)}`}>
            {product.badge}
          </span>
        ) : null}

        <Link to={`/products/${product._id}`} className="featured-card__image-link" tabIndex={-1}>
          <img
            src={imageSrc}
            alt={product.name}
            className="featured-card__image"
            loading="lazy"
            decoding="async"
            width={320}
            height={320}
          />
        </Link>

        <div className="featured-card__overlay">
          <button type="button" className="featured-card__action btn-primary" onClick={handleAddToCart}>
            Add to Cart
          </button>
          {onQuickView ? (
            <button type="button" className="featured-card__action btn-outline" onClick={handleQuickView}>
              Quick View
            </button>
          ) : null}
        </div>
      </div>

      <div className="featured-card__body">
        <Link to={`/products/${product._id}`} className="featured-card__info">
          <h4 className="featured-card__name">{product.name}</h4>
          <p className="featured-card__price">{formatRwf(product.price)}</p>
        </Link>
        <StarRating stars={stars} reviewCount={reviewCount} />
        <div className="featured-card__actions-mobile">
          <button type="button" className="featured-card__action-sm" onClick={handleAddToCart}>
            Add to Cart
          </button>
          {onQuickView ? (
            <button type="button" className="featured-card__action-sm featured-card__action-sm--muted" onClick={handleQuickView}>
              Quick View
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
