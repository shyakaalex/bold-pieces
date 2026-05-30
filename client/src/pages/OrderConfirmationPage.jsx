import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

import ConfirmationCheckmark from "../components/ConfirmationCheckmark";
import StoreLayout from "../components/StoreLayout";
import { api } from "../lib/api";
import { formatOrderId, formatRwf } from "../utils/format";
import { getPaymentUiState } from "../utils/paymentMessages";
import { buildWhatsAppShareUrl } from "../utils/share";

const POLL_INTERVAL_MS = 4000;
const MAX_POLLS = 45;

function isPollingStatus(paymentStatus) {
  return paymentStatus === "pending" || paymentStatus === "submitted";
}

function ConfirmationIcon({ tone }) {
  if (tone === "success") {
    return <ConfirmationCheckmark />;
  }
  if (tone === "error" || tone === "cancelled") {
    return (
      <div className="confirmation-icon confirmation-icon--error" aria-hidden="true">
        <svg viewBox="0 0 52 52" width="72" height="72">
          <circle cx="26" cy="26" r="24" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M18 18l16 16M34 18L18 34" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
    );
  }
  return <div className="confirmation-spinner" aria-hidden="true" />;
}

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [sandbox, setSandbox] = useState(false);
  const [ui, setUi] = useState(() => getPaymentUiState(location.state?.order));
  const [showConfetti, setShowConfetti] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const whatsappUrl = useMemo(() => (order ? buildWhatsAppShareUrl(order) : "#"), [order]);

  useEffect(() => {
    let active = true;
    let attempts = 0;
    let timer;

    const applyOrder = (nextOrder, shwaryMeta) => {
      setOrder((prev) => {
        const prevTone = getPaymentUiState(prev).tone;
        const nextUi = getPaymentUiState(nextOrder);
        if (prevTone !== "success" && nextUi.tone === "success") {
          setShowConfetti(true);
        }
        return nextOrder;
      });
      const nextUi = getPaymentUiState(nextOrder);
      setUi(nextUi);
      if (shwaryMeta?.isSandbox !== undefined) {
        setSandbox(Boolean(shwaryMeta.isSandbox));
      }
      return nextUi;
    };

    const poll = async () => {
      if (!active) return;
      setIsPolling(true);
      try {
        const response = await api.get(`/orders/${id}/payment-status`);
        if (!active) return;

        const nextUi = applyOrder(response.data.order, response.data);

        if (nextUi.polling && attempts < MAX_POLLS) {
          attempts += 1;
          timer = setTimeout(poll, POLL_INTERVAL_MS);
        } else {
          setIsPolling(false);
        }
      } catch {
        if (active) {
          setIsPolling(false);
          setLoadError(true);
          setUi({
            tone: "error",
            headline: "Something went wrong — let's try again.",
            body: "We could not refresh your payment status.",
            polling: false,
            showRetry: true,
          });
        }
      }
    };

    const bootstrap = async () => {
      setLoadError(false);
      try {
        const response = await api.get(`/orders/${id}`);
        if (!active) return;

        const nextUi = applyOrder(response.data, { isSandbox: false });

        if (isPollingStatus(response.data.paymentStatus)) {
          setIsPolling(true);
          timer = setTimeout(poll, POLL_INTERVAL_MS);
        } else {
          if (nextUi.tone === "success") {
            setShowConfetti(true);
          }
          try {
            const statusRes = await api.get(`/orders/${id}/payment-status`);
            if (active && statusRes.data?.isSandbox) {
              setSandbox(true);
            }
          } catch {
            /* optional sandbox flag */
          }
        }
      } catch {
        if (!active) return;
        if (location.state?.order) {
          const nextUi = applyOrder(location.state.order, location.state?.shwary);
          if (nextUi.polling) {
            setIsPolling(true);
            timer = setTimeout(poll, POLL_INTERVAL_MS);
          }
        } else {
          setLoadError(true);
          setUi({
            tone: "error",
            headline: "Order not found",
            body: "We could not load this order. Check the link or contact support.",
            polling: false,
            showRetry: true,
          });
        }
      }
    };

    bootstrap();

    return () => {
      active = false;
      setIsPolling(false);
      if (timer) clearTimeout(timer);
    };
  }, [id, location.state]);

  if (!order && !loadError) {
    return (
      <StoreLayout>
        <section className="confirmation-page">
          <div className="confirmation-spinner" aria-hidden="true" />
          <p className="confirmation-status__body">Confirming your Bold Piece…</p>
        </section>
      </StoreLayout>
    );
  }

  const statusClass = `confirmation-status confirmation-status--${ui.tone}`;

  return (
    <StoreLayout>
      <section className="confirmation-page">
        {showConfetti && ui.tone === "success" ? (
          <div className="confirmation-confetti" aria-hidden="true">
            {Array.from({ length: 24 }).map((_, index) => (
              <span key={index} className="confirmation-confetti__piece" style={{ "--i": index }} />
            ))}
          </div>
        ) : null}

        {sandbox ? (
          <span className="confirmation-sandbox">Sandbox mode — no real payment was taken.</span>
        ) : null}

        <ConfirmationIcon tone={ui.tone} />

        <h1 className="confirmation-page__title">
          {ui.tone === "success"
            ? "Thank you"
            : ui.tone === "error"
              ? "Payment issue"
              : ui.tone === "cancelled"
                ? "Payment cancelled"
                : "Almost there"}
        </h1>

        <div className={statusClass} role="status" aria-live="polite">
          <p className="confirmation-status__headline">{ui.headline}</p>
          <p className="confirmation-status__body">{ui.body}</p>
          {isPolling ? <p className="confirmation-polling-hint">Checking payment status…</p> : null}
          {ui.tone === "error" && order?.paymentFailureReason ? (
            <p className="confirmation-status__reason">{order.paymentFailureReason}</p>
          ) : null}
        </div>

        {order ? (
          <article className="confirmation-card">
            <p className="section-label">Order details</p>
            <dl className="confirmation-dl">
              <div>
                <dt>Order ID</dt>
                <dd>{formatOrderId(order._id)}</dd>
              </div>
              {order.shwaryTransactionId ? (
                <div>
                  <dt>Shwary transaction</dt>
                  <dd className="confirmation-mono">{order.shwaryTransactionId}</dd>
                </div>
              ) : null}
              {order.shwaryTxHash ? (
                <div>
                  <dt>Transaction hash</dt>
                  <dd className="confirmation-mono">{order.shwaryTxHash}</dd>
                </div>
              ) : null}
              <div>
                <dt>Total</dt>
                <dd>{formatRwf(order.total)}</dd>
              </div>
            </dl>

            {ui.tone === "success" ? (
              <p className="confirmation-delivery">📦 Estimated delivery: 2–3 business days in Kigali.</p>
            ) : null}

            <p className="section-label confirmation-section-gap">Items ordered</p>
            <ul className="confirmation-items">
              {order.items.map((item) => (
                <li key={`${item.productId}-${item.name}`}>
                  <span>{item.name}</span>
                  <span>
                    ×{item.qty} · {formatRwf(item.price * item.qty)}
                  </span>
                </li>
              ))}
            </ul>

            <p className="section-label confirmation-section-gap">Shipping</p>
            <address className="confirmation-address">
              {order.customerName}
              <br />
              {order.address}, {order.city}, {order.country}
              <br />
              {order.phone}
              <br />
              {order.email}
            </address>
          </article>
        ) : null}

        <div className="confirmation-actions">
          {ui.tone === "success" && order ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline confirmation-whatsapp"
            >
              Share on WhatsApp
            </a>
          ) : null}
          {ui.showRetry ? (
            <Link to="/checkout" className="btn-primary">
              Try again →
            </Link>
          ) : null}
          <Link to="/" className={ui.showRetry ? "btn-outline" : "btn-primary"}>
            Continue Shopping →
          </Link>
        </div>
      </section>
    </StoreLayout>
  );
}
