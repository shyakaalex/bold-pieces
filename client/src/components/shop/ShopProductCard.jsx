import { useState } from "react";
import { Link } from "react-router-dom";

import { useCart } from "../../context/CartContext";
import { formatRwf, productImage, PRODUCT_FALLBACKS } from "../../utils/format";
import { IconCart } from "../Icons";

export default function ShopProductCard({ product, index = 0 }) {
  const { addToCart, setCartOpen } = useCart();
  const [wishlisted, setWishlisted] = useState(false);

  const image = productImage(product, index, PRODUCT_FALLBACKS);

  const handleAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();
    addToCart(product);
    setCartOpen(true);
  };

  return (
    <article className="shop-card">
      <Link to={`/products/${product._id}`} className="shop-card__media-link">
        <div className="shop-card__media" style={{ backgroundImage: `url('${image}')` }}>
          {product.badge ? <span className="shop-card__badge">{product.badge}</span> : null}
          <button
            type="button"
            className={`shop-card__wishlist ${wishlisted ? "shop-card__wishlist--on" : ""}`}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setWishlisted((v) => !v);
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 20s-7-4.35-7-10a4 4 0 017-2.76A4 4 0 0119 10c0 5.65-7 10-7 10Z"
                stroke="currentColor"
                strokeWidth="1.5"
                fill={wishlisted ? "currentColor" : "none"}
              />
            </svg>
          </button>
        </div>
      </Link>
      <div className="shop-card__body">
        <Link to={`/products/${product._id}`} className="shop-card__title">
          <h3>{product.name}</h3>
          <p className="shop-card__price">{formatRwf(product.price)}</p>
        </Link>
        <button type="button" className="shop-card__cart" aria-label={`Add ${product.name} to cart`} onClick={handleAddToCart}>
          <IconCart size={18} />
        </button>
      </div>
    </article>
  );
}
