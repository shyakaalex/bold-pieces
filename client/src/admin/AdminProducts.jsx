import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { IconSearch } from "../components/Icons";
import { adminClient } from "../lib/api";
import { CATEGORIES, formatRwf, productImage, PRODUCT_FALLBACKS } from "../utils/format";
import {
  getProductSku,
  getProductStatusBadge,
  getProductSubtitle,
  getStockStatus,
} from "../utils/productDisplay";
import AdminProductModal from "./AdminProductModal";
import "../styles/admin-orders.css";
import "../styles/admin-products.css";

const CATEGORY_OPTIONS = ["all", ...CATEGORIES.filter((c) => c !== "All")];
const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];
const STOCK_OPTIONS = [
  { value: "all", label: "All Stock" },
  { value: "in", label: "In stock" },
  { value: "low", label: "Low stock" },
  { value: "out", label: "Out of stock" },
];
const PAGE_SIZES = [10, 25, 50];

function TrendLine({ change, invert = false }) {
  if (change === undefined || change === null) return <span className="orders-kpi__trend">—</span>;
  const up = change >= 0;
  const positive = invert ? !up : up;
  return (
    <span className={`orders-kpi__trend ${positive ? "orders-kpi__trend--up" : "orders-kpi__trend--down"}`}>
      {up ? "↑" : "↓"} {Math.abs(change).toFixed(1)}% vs last month
    </span>
  );
}

function Badge({ tone, label }) {
  return <span className={`orders-badge orders-badge--${tone}`}>{label}</span>;
}

function KpiIcon({ children }) {
  return <span className="orders-kpi__icon">{children}</span>;
}

export default function AdminProducts() {
  const token = localStorage.getItem("bp_admin_token");
  const client = useMemo(() => adminClient(token), [token]);

  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const loadProducts = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (categoryFilter !== "all") params.set("category", categoryFilter);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (stockFilter !== "all") params.set("stock", stockFilter);
    if (searchDebounced) params.set("q", searchDebounced);
    const qs = params.toString() ? `?${params.toString()}` : "";

    Promise.all([client.get(`/products${qs}`), client.get("/products/summary")])
      .then(([productsRes, summaryRes]) => {
        setProducts(productsRes.data);
        setSummary(summaryRes.data);
      })
      .catch(() => {
        setProducts([]);
        setSummary(null);
      })
      .finally(() => setLoading(false));
  }, [client, categoryFilter, statusFilter, stockFilter, searchDebounced]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    setPage(1);
  }, [categoryFilter, statusFilter, stockFilter, searchDebounced, pageSize]);

  const totalPages = Math.max(1, Math.ceil(products.length / pageSize));
  const pageProducts = products.slice((page - 1) * pageSize, page * pageSize);

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
    if (selected.size === pageProducts.length) setSelected(new Set());
    else setSelected(new Set(pageProducts.map((p) => p._id)));
  };

  const toggleOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openCreate = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await client.delete(`/products/${id}`);
    loadProducts();
  };

  const exportCsv = () => {
    const headers = ["SKU", "Name", "Category", "Price", "Stock", "Status", "Material"];
    const rows = products.map((p) => {
      const st = getProductStatusBadge(p.active);
      return [
        getProductSku(p),
        p.name,
        p.category,
        p.price,
        p.stock,
        st.label,
        getProductSubtitle(p),
      ];
    });
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bold-pieces-products-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-page--orders">
      <header className="orders-page-header">
        <div className="orders-page-header__title">
          <h1>Products</h1>
          <p className="orders-breadcrumb">
            <Link to="/admin">Dashboard</Link> &gt; <span>Products</span>
          </p>
        </div>
        <div className="orders-page-header__actions">
          <button type="button" className="btn-outline" onClick={exportCsv}>
            Export
          </button>
          <button type="button" className="btn-primary" onClick={openCreate}>
            + Add Product
          </button>
        </div>
      </header>

      <section className="orders-kpi-grid" aria-label="Product metrics">
        <article className="orders-kpi">
          <p className="orders-kpi__label">Total Products</p>
          <p className="orders-kpi__value">{summary?.totalProducts?.value ?? "—"}</p>
          <KpiIcon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 8h16v10H4V8Z" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </KpiIcon>
          <TrendLine change={summary?.totalProducts?.change} />
        </article>
        <article className="orders-kpi">
          <p className="orders-kpi__label">Active Products</p>
          <p className="orders-kpi__value">{summary?.activeProducts?.value ?? "—"}</p>
          <KpiIcon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 8l8-4 8 4v8l-8 4-8-4V8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </KpiIcon>
          <TrendLine change={summary?.activeProducts?.change} />
        </article>
        <article className="orders-kpi">
          <p className="orders-kpi__label">Out of Stock</p>
          <p className="orders-kpi__value">{summary?.outOfStock?.value ?? "—"}</p>
          <KpiIcon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
              <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </KpiIcon>
          <TrendLine change={summary?.outOfStock?.change} invert />
        </article>
        <article className="orders-kpi">
          <p className="orders-kpi__label">Low Stock</p>
          <p className="orders-kpi__value">{summary?.lowStock?.value ?? "—"}</p>
          <KpiIcon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              <path d="M10.3 4.5h3.4L20 9v9H4V9l6.3-4.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </KpiIcon>
          <TrendLine change={summary?.lowStock?.change} invert />
        </article>
      </section>

      <section className="orders-toolbar" aria-label="Filter products">
        <div className="orders-toolbar__search">
          <IconSearch size={16} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name, SKU or category..."
            aria-label="Search products"
          />
        </div>
        <select
          className="orders-toolbar__select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          aria-label="Filter by category"
        >
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {c === "all" ? "All Categories" : c}
            </option>
          ))}
        </select>
        <select
          className="orders-toolbar__select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <select
          className="orders-toolbar__select"
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          aria-label="Filter by stock"
        >
          {STOCK_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <button type="button" className="orders-toolbar__filters-btn" onClick={loadProducts}>
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
                    checked={pageProducts.length > 0 && selected.size === pageProducts.length}
                    onChange={toggleAll}
                  />
                </th>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="orders-empty">
                    Loading products…
                  </td>
                </tr>
              ) : pageProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="orders-empty">
                    No products match your filters.
                  </td>
                </tr>
              ) : (
                pageProducts.map((product, index) => {
                  const stock = getStockStatus(product.stock);
                  const status = getProductStatusBadge(product.active);
                  const image = productImage(product, index, PRODUCT_FALLBACKS);
                  return (
                    <tr key={product._id}>
                      <td className="orders-table__check">
                        <input
                          type="checkbox"
                          checked={selected.has(product._id)}
                          onChange={() => toggleOne(product._id)}
                          aria-label={`Select ${product.name}`}
                        />
                      </td>
                      <td>
                        <div className="products-table__product">
                          <img src={image} alt="" className="products-table__thumb" />
                          <div>
                            <strong>{product.name}</strong>
                            <span>{getProductSubtitle(product)}</span>
                          </div>
                        </div>
                      </td>
                      <td>{getProductSku(product)}</td>
                      <td>{product.category}</td>
                      <td>{formatRwf(product.price)}</td>
                      <td>
                        <div className="products-stock">
                          <span className={`products-stock__qty products-stock__qty--${stock.tone}`}>{stock.qty}</span>
                          <span className="products-stock__label">{stock.label}</span>
                        </div>
                      </td>
                      <td>
                        <Badge {...status} />
                      </td>
                      <td>
                        <div className="orders-table__actions">
                          <button type="button" aria-label={`Edit ${product.name}`} onClick={() => openEdit(product)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <path
                                d="M4 18h4l10-10-4-4L4 14v4Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                          <button type="button" aria-label="More actions" onClick={() => deleteProduct(product._id)}>
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
            Showing {products.length === 0 ? 0 : (page - 1) * pageSize + 1} to{" "}
            {Math.min(page * pageSize, products.length)} of {products.length} products
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

      <AdminProductModal
        open={modalOpen}
        product={editingProduct}
        client={client}
        onClose={() => setModalOpen(false)}
        onSaved={loadProducts}
      />
    </div>
  );
}
