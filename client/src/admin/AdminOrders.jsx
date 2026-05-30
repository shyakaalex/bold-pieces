import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { IconSearch } from "../components/Icons";
import { adminClient } from "../lib/api";
import {
  formatAdminOrderId,
  formatOrderDateTime,
  getFulfillmentBadge,
  getOrderStatusBadge,
  getPaymentBadge,
} from "../utils/orderDisplay";
import { formatRwf } from "../utils/format";
import "../styles/admin-orders.css";

const STATUS_OPTIONS = ["All", "Pending", "Processing", "Delivered", "Cancelled"];
const PAYMENT_OPTIONS = [
  { value: "all", label: "All Payments" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "refunded", label: "Refunded" },
];

const PAGE_SIZES = [10, 25, 50];

function defaultDateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 6);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

function TrendLine({ change, suffix = "vs last month" }) {
  if (change === undefined || change === null) return <span className="orders-kpi__trend">—</span>;
  const up = change >= 0;
  return (
    <span className={`orders-kpi__trend ${up ? "orders-kpi__trend--up" : "orders-kpi__trend--down"}`}>
      {up ? "↑" : "↓"} {Math.abs(change).toFixed(1)}% {suffix}
    </span>
  );
}

function Badge({ tone, label }) {
  return <span className={`orders-badge orders-badge--${tone}`}>{label}</span>;
}

function KpiIcon({ children }) {
  return <span className="orders-kpi__icon">{children}</span>;
}

export default function AdminOrders() {
  const token = localStorage.getItem("bp_admin_token");
  const client = useMemo(() => adminClient(token), [token]);

  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [dateRange, setDateRange] = useState(defaultDateRange);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const loadOrders = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "All") params.set("status", statusFilter);
    if (paymentFilter !== "all") params.set("payment", paymentFilter);
    if (searchDebounced) params.set("q", searchDebounced);
    if (dateRange.from) params.set("from", dateRange.from);
    if (dateRange.to) params.set("to", dateRange.to);
    const qs = params.toString() ? `?${params.toString()}` : "";

    Promise.all([client.get(`/orders${qs}`), client.get("/orders/summary")])
      .then(([ordersRes, summaryRes]) => {
        setOrders(ordersRes.data);
        setSummary(summaryRes.data);
      })
      .catch(() => {
        setOrders([]);
        setSummary(null);
      })
      .finally(() => setLoading(false));
  }, [client, statusFilter, paymentFilter, searchDebounced, dateRange]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, paymentFilter, searchDebounced, dateRange, pageSize]);

  const totalPages = Math.max(1, Math.ceil(orders.length / pageSize));
  const pageOrders = orders.slice((page - 1) * pageSize, page * pageSize);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (page > 3) pages.push("…");
    for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p += 1) {
      pages.push(p);
    }
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
    return pages;
  }, [page, totalPages]);

  const toggleAll = () => {
    if (selected.size === pageOrders.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(pageOrders.map((o) => o._id)));
    }
  };

  const toggleOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const exportCsv = () => {
    const headers = ["Order ID", "Customer", "Email", "Date", "Status", "Payment", "Total", "Fulfillment"];
    const rows = orders.map((o) => {
      const st = getOrderStatusBadge(o.status);
      const pay = getPaymentBadge(o.paymentStatus, o.status);
      const ful = getFulfillmentBadge(o.status);
      return [
        formatAdminOrderId(o._id),
        o.customerName,
        o.email,
        formatOrderDateTime(o.createdAt),
        st.label,
        pay.label,
        o.total,
        ful.label,
      ];
    });
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bold-pieces-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-page--orders">
      <header className="orders-page-header">
        <div className="orders-page-header__title">
          <h1>Orders</h1>
          <p className="orders-breadcrumb">
            <Link to="/admin">Dashboard</Link> &gt; <span>Orders</span>
          </p>
        </div>
        <div className="orders-page-header__actions">
          <button type="button" className="btn-outline" onClick={exportCsv}>
            Export
          </button>
          <button type="button" className="btn-primary" disabled title="Coming soon">
            Create Order
          </button>
        </div>
      </header>

      <section className="orders-kpi-grid" aria-label="Order metrics">
        <article className="orders-kpi">
          <p className="orders-kpi__label">Total Orders (This month)</p>
          <p className="orders-kpi__value">{summary?.totalOrders?.value ?? "—"}</p>
          <KpiIcon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6h15l-1.5 9h-12L6 6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </KpiIcon>
          <TrendLine change={summary?.totalOrders?.change} />
        </article>
        <article className="orders-kpi">
          <p className="orders-kpi__label">Total Revenue (This month)</p>
          <p className="orders-kpi__value">{summary ? formatRwf(summary.totalRevenue?.value) : "—"}</p>
          <KpiIcon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </KpiIcon>
          <TrendLine change={summary?.totalRevenue?.change} />
        </article>
        <article className="orders-kpi">
          <p className="orders-kpi__label">Pending Orders</p>
          <p className="orders-kpi__value">{summary?.pendingOrders?.value ?? "—"}</p>
          <KpiIcon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </KpiIcon>
          <span className="orders-kpi__trend">
            {summary?.pendingOrders?.share !== undefined
              ? `${summary.pendingOrders.share.toFixed(1)}% of total orders`
              : "—"}
          </span>
        </article>
        <article className="orders-kpi">
          <p className="orders-kpi__label">Average Order Value</p>
          <p className="orders-kpi__value">{summary ? formatRwf(summary.averageOrderValue?.value) : "—"}</p>
          <KpiIcon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 8h16v10H4V8Z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </KpiIcon>
          <TrendLine change={summary?.averageOrderValue?.change} />
        </article>
      </section>

      <section className="orders-toolbar" aria-label="Filter orders">
        <div className="orders-toolbar__search">
          <IconSearch size={16} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders by ID, customer or email..."
            aria-label="Search orders"
          />
        </div>
        <select
          className="orders-toolbar__select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === "All" ? "All Statuses" : s}
            </option>
          ))}
        </select>
        <select
          className="orders-toolbar__select"
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          aria-label="Filter by payment"
        >
          {PAYMENT_OPTIONS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="orders-toolbar__date"
          value={dateRange.from}
          onChange={(e) => setDateRange((d) => ({ ...d, from: e.target.value }))}
          aria-label="From date"
        />
        <input
          type="date"
          className="orders-toolbar__date"
          value={dateRange.to}
          onChange={(e) => setDateRange((d) => ({ ...d, to: e.target.value }))}
          aria-label="To date"
        />
        <button type="button" className="orders-toolbar__filters-btn" onClick={loadOrders}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Refresh
        </button>
      </section>

      <section className="orders-table-panel">
        <div className="orders-table-wrap">
          <table className="orders-table">
            <thead>
              <tr>
                <th className="orders-table__check">
                  <input
                    type="checkbox"
                    aria-label="Select all on page"
                    checked={pageOrders.length > 0 && selected.size === pageOrders.length}
                    onChange={toggleAll}
                  />
                </th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Fulfillment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="orders-empty">
                    Loading orders…
                  </td>
                </tr>
              ) : pageOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="orders-empty">
                    No orders match your filters.
                  </td>
                </tr>
              ) : (
                pageOrders.map((order) => {
                  const statusBadge = getOrderStatusBadge(order.status);
                  const paymentBadge = getPaymentBadge(order.paymentStatus, order.status);
                  const fulfillmentBadge = getFulfillmentBadge(order.status);
                  return (
                    <tr key={order._id}>
                      <td className="orders-table__check">
                        <input
                          type="checkbox"
                          checked={selected.has(order._id)}
                          onChange={() => toggleOne(order._id)}
                          aria-label={`Select order ${formatAdminOrderId(order._id)}`}
                        />
                      </td>
                      <td>
                        <Link to={`/admin/orders/${order._id}`} className="orders-table__id">
                          {formatAdminOrderId(order._id)}
                        </Link>
                      </td>
                      <td className="orders-table__customer">
                        <strong>{order.customerName}</strong>
                        <span>{order.email}</span>
                      </td>
                      <td>{formatOrderDateTime(order.createdAt)}</td>
                      <td>
                        <Badge {...statusBadge} />
                      </td>
                      <td>
                        <Badge {...paymentBadge} />
                      </td>
                      <td>{formatRwf(order.total)}</td>
                      <td>
                        <Badge {...fulfillmentBadge} />
                      </td>
                      <td>
                        <div className="orders-table__actions">
                          <Link to={`/admin/orders/${order._id}`} aria-label="View order">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <path
                                d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                              />
                              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                            </svg>
                          </Link>
                          <button type="button" aria-label="More actions" title="More actions">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <circle cx="6" cy="12" r="1.5" fill="currentColor" />
                              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                              <circle cx="18" cy="12" r="1.5" fill="currentColor" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <footer className="orders-pagination">
          <label>
            Show{" "}
            <select
              className="orders-toolbar__select"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              aria-label="Entries per page"
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>{" "}
            entries
          </label>
          <span>
            Showing {orders.length === 0 ? 0 : (page - 1) * pageSize + 1} to{" "}
            {Math.min(page * pageSize, orders.length)} of {orders.length} orders
          </span>
          <div className="orders-pagination__pages">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} aria-label="Previous page">
              ‹
            </button>
            {pageNumbers.map((n, i) =>
              n === "…" ? (
                <span key={`ellipsis-${i}`} className="ellipsis">
                  …
                </span>
              ) : (
                <button
                  key={n}
                  type="button"
                  className={page === n ? "is-active" : ""}
                  onClick={() => setPage(n)}
                  aria-label={`Page ${n}`}
                  aria-current={page === n ? "page" : undefined}
                >
                  {n}
                </button>
              )
            )}
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              aria-label="Next page"
            >
              ›
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
