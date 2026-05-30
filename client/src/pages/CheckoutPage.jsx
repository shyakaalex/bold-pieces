import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import CheckoutProgress from "../components/CheckoutProgress";
import StoreLayout from "../components/StoreLayout";
import { useCart } from "../context/CartContext";
import { useCustomer } from "../context/CustomerContext";
import { api, checkoutHeaders } from "../lib/api";
import {
  COUNTRY_OPTIONS,
  formatRwf,
  productImage,
  PRODUCT_FALLBACKS,
  readUtmParams,
} from "../utils/format";
import {
  mergeErrors,
  validateCheckoutContact,
  validateCheckoutPayment,
  validateCheckoutShipping,
} from "../utils/checkoutValidation";

const defaultCountry = COUNTRY_OPTIONS[0];

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { customer } = useCustomer();
  const navigate = useNavigate();
  const [step, setStep] = useState(2);
  const [countryCode, setCountryCode] = useState(defaultCountry.code);
  const [form, setForm] = useState({
    customerName: customer?.name || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    address: "",
    city: "Kigali",
    country: "Rwanda",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");

  const selectedCountry = COUNTRY_OPTIONS.find((c) => c.code === countryCode) || defaultCountry;

  const update = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const goToPayment = (event) => {
    event.preventDefault();
    const errors = mergeErrors(validateCheckoutContact(form), validateCheckoutShipping(form));
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError("Something went wrong — let's try again. Check the highlighted fields.");
      return;
    }
    setError("");
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitCheckout = async (event) => {
    event.preventDefault();
    if (cart.length === 0) {
      setError("Your collection awaits — add a piece first.");
      return;
    }

    const errors = mergeErrors(
      validateCheckoutContact(form),
      validateCheckoutShipping(form),
      validateCheckoutPayment(form, selectedCountry.prefix)
    );
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError("Something went wrong — let's try again. Check the highlighted fields.");
      return;
    }

    setLoading(true);
    setError("");
    setPaymentMessage("Confirming your Bold Piece…");

    const utm = readUtmParams();
    const payload = {
      customerName: form.customerName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      countryCode,
      country: selectedCountry.label,
      items: cart.map((item) => ({
        productId: item._id,
        name: item.name,
        qty: item.qty,
        price: item.price,
      })),
      ...utm,
    };

    try {
      const response = await api.post("/checkout", payload, { headers: checkoutHeaders() });
      const order = response.data.order;
      const shwary = response.data.shwary;

      if (order.paymentStatus === "submitted" || order.paymentStatus === "pending") {
        setPaymentMessage("Approve the payment on your phone — Confirming your Bold Piece…");
      } else if (order.paymentStatus === "completed") {
        setPaymentMessage("Your Bold Piece is on its way.");
      }

      clearCart();
      navigate(`/confirmation/${order._id}`, {
        state: { order, shwary: { ...shwary, isSandbox: response.data.sandbox }, sandbox: response.data.sandbox },
      });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.response?.status === 503
          ? "Payments are not configured. Add SHWARY_MERCHANT_KEY to server/.env."
          : "Payment didn't go through — please try again.");
      setError(message);
      setPaymentMessage("");
      if (err.response?.data?.orderId) {
        navigate(`/confirmation/${err.response.data.orderId}`, {
          state: { failed: true },
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <StoreLayout>
        <section className="checkout-page checkout-empty">
          <p>Your collection awaits.</p>
          <Link to="/shop" className="btn-primary">
            Browse the Collection →
          </Link>
        </section>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <section className="checkout-page">
        <h1 className="checkout-page__title">Checkout</h1>
        <p className="checkout-page__subtitle">Complete your Bold Piece — delivered across Rwanda.</p>

        <CheckoutProgress currentStep={step} />

        <div className="checkout-layout">
          <div className="checkout-form-panel">
            {step === 2 ? (
              <form className="checkout-card" onSubmit={goToPayment} noValidate>
                <h2 className="checkout-card__heading">Contact</h2>
                <div className="checkout-fields">
                  <div className="field">
                    <label htmlFor="checkout-name">Full name</label>
                    <input
                      id="checkout-name"
                      value={form.customerName}
                      onChange={update("customerName")}
                      placeholder="e.g. Marie Uwase"
                      className={fieldErrors.customerName ? "field--error" : ""}
                      autoComplete="name"
                      required
                    />
                    {fieldErrors.customerName ? <p className="field__error">{fieldErrors.customerName}</p> : null}
                  </div>
                  <div className="field">
                    <label htmlFor="checkout-email">Email</label>
                    <input
                      id="checkout-email"
                      type="email"
                      value={form.email}
                      onChange={update("email")}
                      placeholder="e.g. you@email.com"
                      className={fieldErrors.email ? "field--error" : ""}
                      autoComplete="email"
                      required
                    />
                    {fieldErrors.email ? <p className="field__error">{fieldErrors.email}</p> : null}
                  </div>
                </div>

                <h2 className="checkout-card__heading" style={{ marginTop: 24 }}>
                  Shipping
                </h2>
                <div className="checkout-fields">
                  <div className="field">
                    <label htmlFor="checkout-country">Country</label>
                    <select
                      id="checkout-country"
                      value={countryCode}
                      onChange={(e) => {
                        setCountryCode(e.target.value);
                        const c = COUNTRY_OPTIONS.find((o) => o.code === e.target.value);
                        if (c) setForm((p) => ({ ...p, country: c.label }));
                      }}
                    >
                      {COUNTRY_OPTIONS.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label} ({c.currency})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="checkout-address">Delivery address</label>
                    <input
                      id="checkout-address"
                      value={form.address}
                      onChange={update("address")}
                      placeholder="e.g. KG 123 St, Kacyiru"
                      className={fieldErrors.address ? "field--error" : ""}
                      autoComplete="street-address"
                      required
                    />
                    {fieldErrors.address ? <p className="field__error">{fieldErrors.address}</p> : null}
                  </div>
                  <div className="checkout-fields checkout-fields--row">
                    <div className="field">
                      <label htmlFor="checkout-city">City</label>
                      <input
                        id="checkout-city"
                        value={form.city}
                        onChange={update("city")}
                        placeholder="e.g. Kigali"
                        className={fieldErrors.city ? "field--error" : ""}
                        autoComplete="address-level2"
                        required
                      />
                      {fieldErrors.city ? <p className="field__error">{fieldErrors.city}</p> : null}
                    </div>
                  </div>
                </div>

                <div className="checkout-actions">
                  <button type="submit" className="btn-primary">
                    Continue to Confirm & Pay →
                  </button>
                </div>
              </form>
            ) : (
              <form className="checkout-card" onSubmit={submitCheckout} noValidate>
                <h2 className="checkout-card__heading">Payment</h2>
                <p className="checkout-trust">Join 400+ Bold Pieces customers in Rwanda.</p>
                <div className="checkout-fields">
                  <div className="field">
                    <label htmlFor="checkout-phone">Mobile Money number</label>
                    <input
                      id="checkout-phone"
                      value={form.phone}
                      onChange={update("phone")}
                      placeholder="e.g. +250 780 000 000"
                      className={fieldErrors.phone ? "field--error" : ""}
                      autoComplete="tel"
                      inputMode="tel"
                      required
                    />
                    {fieldErrors.phone ? <p className="field__error">{fieldErrors.phone}</p> : null}
                  </div>
                </div>

                {error ? <p className="payment-status payment-status--error">{error}</p> : null}
                {paymentMessage && !error ? <p className="payment-status">{paymentMessage}</p> : null}

                <div className="checkout-actions">
                  <button type="button" className="btn-outline" onClick={() => setStep(2)} disabled={loading}>
                    Back to Shipping
                  </button>
                  <button type="submit" className="btn-primary" disabled={loading} aria-busy={loading}>
                    {loading ? (
                      <>
                        <span className="btn-spinner" aria-hidden="true" />
                        Processing…
                      </>
                    ) : (
                      `Pay securely · ${formatRwf(cartTotal)}`
                    )}
                  </button>
                </div>
                <p className="checkout-secure" aria-label="Secured by Shwary Mobile Money">
                  <span aria-hidden="true">🔒</span> Secured by Shwary Mobile Money
                </p>
              </form>
            )}
          </div>

          <aside className="checkout-summary" aria-label="Order summary">
            <h2>Order summary</h2>
            {cart.map((item, index) => (
              <div key={item._id} className="summary-item">
                <div
                  className="summary-item__thumb"
                  style={{ backgroundImage: `url('${productImage(item, index, PRODUCT_FALLBACKS)}')` }}
                  role="img"
                  aria-label={item.name}
                />
                <div>
                  <p className="summary-item__name">{item.name}</p>
                  <p className="summary-item__meta">Qty {item.qty}</p>
                </div>
                <span className="summary-item__price">{formatRwf(item.price * item.qty)}</span>
              </div>
            ))}
            <div className="summary-subtotal">
              <span>Subtotal</span>
              <span>{formatRwf(cartTotal)}</span>
            </div>
            <div className="summary-total">
              <strong>Total</strong>
              <strong>{formatRwf(cartTotal)}</strong>
            </div>
            <p className="checkout-trust">📦 Free delivery in Kigali on orders over RWF 200,000.</p>
          </aside>
        </div>
      </section>
    </StoreLayout>
  );
}
