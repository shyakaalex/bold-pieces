/** Admin order display helpers */

export function formatAdminOrderId(id) {
  const tail = String(id).slice(-4).toUpperCase();
  return `#BP-${tail}`;
}

export function getOrderStatusBadge(status) {
  const s = String(status || "").toLowerCase();
  if (["done"].includes(s)) return { label: "Delivered", tone: "delivered" };
  if (["shipped", "paid"].includes(s)) return { label: "Processing", tone: "processing" };
  if (["cancelled", "failed"].includes(s)) return { label: "Cancelled", tone: "cancelled" };
  return { label: "Pending", tone: "pending" };
}

export function getPaymentBadge(paymentStatus, orderStatus) {
  const ps = String(paymentStatus || "").toLowerCase();
  if (ps === "completed" || orderStatus === "paid") return { label: "Paid", tone: "paid" };
  if (["failed", "cancelled"].includes(ps)) return { label: "Refunded", tone: "refunded" };
  if (ps === "submitted") return { label: "Pending", tone: "pending" };
  return { label: "Unpaid", tone: "unpaid" };
}

export function getFulfillmentBadge(status) {
  const s = String(status || "").toLowerCase();
  if (s === "done") return { label: "Fulfilled", tone: "fulfilled" };
  if (s === "shipped") return { label: "Partially fulfilled", tone: "partial" };
  if (["cancelled", "failed"].includes(s)) return { label: "Cancelled", tone: "cancelled" };
  return { label: "Unfulfilled", tone: "unfulfilled" };
}

export function formatOrderDateTime(iso) {
  return new Date(iso).toLocaleString("en-RW", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
