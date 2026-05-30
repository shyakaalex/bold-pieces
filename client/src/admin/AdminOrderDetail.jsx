import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { adminClient } from "../lib/api";
import { formatOrderId, formatRwf } from "../utils/format";

export default function AdminOrderDetail() {
  const { id } = useParams();
  const token = localStorage.getItem("bp_admin_token");
  const client = adminClient(token);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    client.get(`/orders/${id}`).then((r) => setOrder(r.data));
  }, [client, id]);

  if (!order) return <p>Loading order…</p>;

  return (
    <>
      <div className="admin-topbar">
        <h1>{formatOrderId(order._id)}</h1>
        <Link to="/admin/orders">Back to orders</Link>
      </div>
      <article className="admin-panel">
        <p>
          <strong>Customer:</strong> {order.customerName}
        </p>
        <p>
          <strong>Email:</strong> {order.email}
        </p>
        <p>
          <strong>Phone:</strong> {order.phone}
        </p>
        <p>
          <strong>Address:</strong> {order.address}, {order.city}, {order.country}
        </p>
        <p>
          <strong>Status:</strong> {order.status} / {order.paymentStatus}
        </p>
        {order.shwaryTransactionId ? (
          <p>
            <strong>Shwary ID:</strong> {order.shwaryTransactionId}
          </p>
        ) : null}
        <p>
          <strong>Total:</strong> {formatRwf(order.total)}
        </p>
        <h2>Items</h2>
        {order.items.map((item) => (
          <div key={`${item.productId}-${item.name}`} className="summary-row">
            <span>
              {item.name} × {item.qty}
            </span>
            <span>{formatRwf(item.price * item.qty)}</span>
          </div>
        ))}
      </article>
    </>
  );
}
