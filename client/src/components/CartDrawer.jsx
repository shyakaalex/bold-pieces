import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { useCart } from "../context/CartContext";
import { formatRwf, productImage, PRODUCT_FALLBACKS } from "../utils/format";
import { IconClose } from "./Icons";

const FREE_DELIVERY_THRESHOLD = 200_000;

function DeliveryProgress({ total }) {
  const unlocked = total >= FREE_DELIVERY_THRESHOLD;
  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - total);
  const percent = Math.min(100, (total / FREE_DELIVERY_THRESHOLD) * 100);

  return (
    <div className={`cart-drawer__delivery ${unlocked ? "cart-drawer__delivery--unlocked" : ""}`}>
      <p className="cart-drawer__delivery-msg">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M3 7h11v9H3V7Zm11 2h4l2 3v4h-6V9Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="7" cy="18" r="1.5" fill="currentColor" />
          <circle cx="17" cy="18" r="1.5" fill="currentColor" />
        </svg>
        {unlocked ? (
          <span>
            <strong>Free delivery unlocked!</strong> on this order
          </span>
        ) : (
          <span>
            You&apos;re <strong>{formatRwf(remaining)}</strong> away from free delivery
          </span>
        )}
      </p>
      <div className="cart-drawer__progress-wrap" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <div className="cart-drawer__progress-bar" style={{ width: `${percent}%` }} />
      </div>
      <p className="cart-drawer__progress-goal">{formatRwf(FREE_DELIVERY_THRESHOLD)}</p>
    </div>
  );
}

function TrustStrip() {
  const items = [
    {
      label: "Free delivery",
      sub: "Over RWF 200,000",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M3 7h11v9H3V7Zm11 2h4l2 3v4h-6V9Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: "Secure checkout",
      sub: "100% safe payment",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      label: "30-day returns",
      sub: "Easy & hassle-free",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 12a8 8 0 0114-5M20 12a8 8 0 01-14 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M4 7v5h5M20 17v-5h-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];

  return (
    <div className="cart-drawer__trust">
      {items.map((item) => (
        <div key={item.label} className="cart-drawer__trust-item">
          {item.icon}
          <div>
            <strong>{item.label}</strong>
            {item.sub}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, cartTotal, cartCount, changeQty, removeFromCart } = useCart();
  const drawerRef = useRef(null);
  const closeBtnRef = useRef(null);
  const [giftOpen, setGiftOpen] = useState(false);
  const [giftNote, setGiftNote] = useState(() => sessionStorage.getItem("bp_gift_note") || "");

  const deliveryFree = cartTotal >= FREE_DELIVERY_THRESHOLD;
  useEffect(() => {
    if (giftNote) sessionStorage.setItem("bp_gift_note", giftNote);
    else sessionStorage.removeItem("bp_gift_note");
  }, [giftNote]);

  useEffect(() => {
    if (!cartOpen) return;

    closeBtnRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setCartOpen(false);
        return;
      }
      if (event.key !== "Tab" || !drawerRef.current) return;

      const focusable = drawerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const nodes = [...focusable].filter((el) => !el.disabled);
      if (nodes.length === 0) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [cartOpen, setCartOpen]);

  const titleLabel = useMemo(() => {
    if (cartCount === 0) return "Your Cart";
    return `Your Cart (${cartCount})`;
  }, [cartCount]);

  if (!cartOpen) return null;

  return (
    <>
      <button
        type="button"
        className="cart-drawer__backdrop"
        aria-label="Close cart"
        onClick={() => setCartOpen(false)}
      />
      <aside
        ref={drawerRef}
        className="cart-drawer open"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
      >
        <header className="cart-drawer__header">
          <h2 id="cart-drawer-title" className="cart-drawer__title">
            {titleLabel}
          </h2>
          <button
            ref={closeBtnRef}
            type="button"
            className="cart-drawer__close"
            onClick={() => setCartOpen(false)}
            aria-label="Close cart"
          >
            <IconClose size={22} />
          </button>
        </header>

        <div className="cart-drawer__scroll">
          {cart.length > 0 ? <DeliveryProgress total={cartTotal} /> : null}

          <div className="cart-drawer__items">
            {cart.length === 0 ? (
              <p className="cart-drawer__empty">
                Your collection awaits.{" "}
                <Link to="/shop" onClick={() => setCartOpen(false)}>
                  Browse pieces →
                </Link>
              </p>
            ) : (
              cart.map((item, index) => {
                const lineTotal = item.price * item.qty;
                return (
                  <article key={item._id} className="cart-line">
                    <button
                      type="button"
                      className="cart-line__remove"
                      aria-label={`Remove ${item.name}`}
                      onClick={() => removeFromCart(item._id)}
                    >
                      ×
                    </button>
                    <div
                      className="cart-line__thumb"
                      style={{ backgroundImage: `url('${productImage(item, index, PRODUCT_FALLBACKS)}')` }}
                      role="img"
                      aria-label={item.name}
                    />
                    <div className="cart-line__body">
                      <h3 className="cart-line__name">{item.name}</h3>
                      <p className="cart-line__unit">{formatRwf(item.price)}</p>
                      <div className="cart-line__footer">
                        <div className="cart-line__qty">
                          <button
                            type="button"
                            onClick={() => changeQty(item._id, -1)}
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span aria-live="polite">{item.qty}</span>
                          <button
                            type="button"
                            onClick={() => changeQty(item._id, 1)}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <span className="cart-line__total">{formatRwf(lineTotal)}</span>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {cart.length > 0 ? (
            <>
              <button
                type="button"
                className="cart-drawer__gift"
                aria-expanded={giftOpen}
                onClick={() => setGiftOpen((v) => !v)}
              >
                <span className="cart-drawer__gift-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M4 10h16v10H4V10Z" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M12 10V6M8 6h8a2 2 0 010 4H8a2 2 0 010-4Z" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </span>
                <span className="cart-drawer__gift-text">
                  <strong>Add a gift note</strong>
                  <span>Make it extra special</span>
                </span>
                <span className="cart-drawer__gift-chevron" aria-hidden="true">
                  {giftOpen ? "⌄" : "›"}
                </span>
              </button>

              {giftOpen ? (
                <div className="cart-drawer__gift-note">
                  <label htmlFor="cart-gift-note" className="visually-hidden">
                    Gift message
                  </label>
                  <textarea
                    id="cart-gift-note"
                    value={giftNote}
                    onChange={(e) => setGiftNote(e.target.value)}
                    placeholder="Write a message for the recipient…"
                  />
                </div>
              ) : null}

              <section className="cart-drawer__summary" aria-labelledby="cart-summary-title">
                <h3 id="cart-summary-title">Order Summary</h3>
                <div className="cart-drawer__summary-row">
                  <span>
                    Subtotal ({cartCount} item{cartCount === 1 ? "" : "s"})
                  </span>
                  <span>{formatRwf(cartTotal)}</span>
                </div>
                <div className="cart-drawer__summary-row cart-drawer__summary-row--delivery">
                  <span>Delivery</span>
                  <span>{deliveryFree ? "Free" : "Calculated at checkout"}</span>
                </div>
                <div className="cart-drawer__summary-row cart-drawer__summary-row--total">
                  <span>Total</span>
                  <span>{formatRwf(cartTotal)}</span>
                </div>
              </section>

              <TrustStrip />
            </>
          ) : null}
        </div>

        {cart.length > 0 ? (
          <footer className="cart-drawer__footer">
            <Link
              to="/checkout"
              className="btn-primary cart-drawer__checkout"
              onClick={() => setCartOpen(false)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.75" />
                <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.75" />
              </svg>
              Proceed to Checkout
              <span aria-hidden="true">→</span>
            </Link>
            <button type="button" className="btn-outline cart-drawer__continue" onClick={() => setCartOpen(false)}>
              Continue Shopping
            </button>
            <div className="cart-drawer__payments">
              <span>We accept</span>
              <div className="cart-drawer__payment-badges">
                <span>Visa</span>
                <span>Mastercard</span>
                <span>Airtel</span>
                <span>M-Pesa</span>
                <span>Apple Pay</span>
              </div>
            </div>
          </footer>
        ) : null}
      </aside>
    </>
  );
}
