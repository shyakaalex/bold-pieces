import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { adminClient } from "../lib/api";
import { formatOrderId, formatRwf } from "../utils/format";

export default function AdminDashboard() {
  const token = localStorage.getItem("bp_admin_token");
  const client = adminClient(token);
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    Promise.all([client.get("/analytics"), client.get("/orders"), client.get("/products")]).then(
      ([a, o, p]) => {
        setAnalytics(a.data);
        setOrders(o.data);
        setProducts(p.data);
      }
    );
  }, [client]);

  const lowStock = products.filter((p) => p.stock <= 5);

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Good morning, Admin</h1>
          <p>Here&apos;s what&apos;s happening with your store today.</p>
        </div>
      </div>

      <section className="kpi-grid">
        <article className="kpi-card">
          <small>Total Revenue (7d)</small>
          <strong>{formatRwf(analytics?.kpis?.revenue?.value || 0)}</strong>
          <span>{analytics ? `${analytics.kpis.revenue.change >= 0 ? "+" : ""}${analytics.kpis.revenue.change.toFixed(1)}% vs prior 7 days` : "—"}</span>
        </article>
        <article className="kpi-card">
          <small>Total Orders (7d)</small>
          <strong>{analytics?.kpis?.orders?.value ?? 0}</strong>
          <span>{analytics ? `${analytics.kpis.orders.change >= 0 ? "+" : ""}${analytics.kpis.orders.change.toFixed(1)}% vs prior 7 days` : "—"}</span>
        </article>
        <article className="kpi-card">
          <small>New Subscribers (7d)</small>
          <strong>{analytics?.kpis?.customers?.value ?? 0}</strong>
          <span>{analytics ? `${analytics.kpis.customers.change >= 0 ? "+" : ""}${analytics.kpis.customers.change.toFixed(1)}% vs prior 7 days` : "—"}</span>
        </article>
        <article className="kpi-card">
          <small>Pending fulfillment</small>
          <strong>{analytics?.statusCounts?.pending ?? 0}</strong>
          <span>Processing: {analytics?.statusCounts?.processing ?? 0}</span>
        </article>
      </section>

      <section className="admin-metrics">
        <article className="admin-panel chart-panel">
          <div className="panel-headline">
            <h2>Revenue Overview</h2>
            <span>Last 7 days</span>
          </div>
          <div className="chart-placeholder">
            {(analytics?.revenueByDay || []).map((day) => (
              <i
                key={day.date}
                style={{ height: `${Math.max(8, (day.revenue / (analytics.maxRevenue || 1)) * 100)}%` }}
                title={`${day.date}: ${formatRwf(day.revenue)}`}
              />
            ))}
          </div>
        </article>
        <article className="admin-panel status-panel">
          <div className="panel-headline">
            <h2>Orders by Status</h2>
          </div>
          <div className="status-rows">
            <div>
              <span>Pending</span>
              <b>{analytics?.statusCounts?.pending ?? 0}</b>
            </div>
            <div>
              <span>Processing</span>
              <b>{analytics?.statusCounts?.processing ?? 0}</b>
            </div>
            <div>
              <span>Delivered</span>
              <b>{analytics?.statusCounts?.delivered ?? 0}</b>
            </div>
          </div>
        </article>
      </section>

      <section className="admin-content-grid">
        <article className="admin-panel">
          <div className="panel-headline">
            <h2>Recent Orders</h2>
            <Link to="/admin/orders">View all</Link>
          </div>
          <div className="mini-list">
            {orders.slice(0, 5).map((order) => (
              <Link key={order._id} to={`/admin/orders/${order._id}`} className="mini-row">
                <img src="/assets/products/jw1.png" alt="" />
                <div>
                  <strong>{formatOrderId(order._id)}</strong>
                  <span>{order.customerName}</span>
                </div>
                <em>{order.status}</em>
              </Link>
            ))}
          </div>
        </article>
        <article className="admin-panel">
          <div className="panel-headline">
            <h2>Low Stock Alerts</h2>
          </div>
          <div className="mini-list">
            {lowStock.length === 0 ? (
              <p>All products well stocked.</p>
            ) : (
              lowStock.map((item) => (
                <div key={item._id} className="mini-row">
                  <img src={item.image} alt={item.name} />
                  <div>
                    <strong>{item.name}</strong>
                    <span>Only {item.stock} left</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </>
  );
}
