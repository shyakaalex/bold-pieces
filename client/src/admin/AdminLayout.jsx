import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { adminClient } from "../lib/api";
import "../styles/admin-orders.css";

const NAV = [
  { to: "/admin", end: true, label: "Dashboard" },
  { to: "/admin/orders", label: "Orders", badge: true },
  { to: "/admin/products", label: "Products", countKey: "products" },
  { to: "/admin/customers", label: "Customers" },
  { to: "/admin/analytics", label: "Analytics" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const token = localStorage.getItem("bp_admin_token");
  const client = useMemo(() => adminClient(token), [token]);
  const [orderCount, setOrderCount] = useState(0);
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    Promise.all([client.get("/orders"), client.get("/products")])
      .then(([ordersRes, productsRes]) => {
        setOrderCount(ordersRes.data.length);
        setProductCount(productsRes.data.length);
      })
      .catch(() => {
        setOrderCount(0);
        setProductCount(0);
      });
  }, [client]);

  return (
    <div className="admin-shell admin-theme">
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-brand">
            <img src="/assets/logo/White & Gold Full.png" alt="Bold Pieces" className="admin-brand-logo" />
          </div>

          <nav className="admin-sidebar__nav" aria-label="Admin">
            {NAV.map(({ to, end, label, badge, countKey }) => (
              <NavLink key={to} to={to} end={end} className="admin-sidebar__link">
                <span>{label}</span>
                {badge && orderCount > 0 ? <span className="admin-sidebar__badge">{orderCount}</span> : null}
                {countKey === "products" && productCount > 0 ? (
                  <span className="admin-sidebar__badge admin-sidebar__badge--muted">{productCount}</span>
                ) : null}
              </NavLink>
            ))}
          </nav>

          <p className="admin-sidebar__section-label">Sales channels</p>
          <button type="button" className="admin-sidebar__link" onClick={() => navigate("/")}>
            <span>Online Store ↗</span>
          </button>

          <div className="admin-sidebar__help">
            <strong>Need help?</strong>
            Contact support at hello@boldpieces.com
          </div>

          <div className="admin-sidebar__profile">
            <span className="admin-sidebar__avatar" aria-hidden="true">
              A
            </span>
            <div>
              <strong>Admin</strong>
              <span>admin@boldpieces.rw</span>
            </div>
          </div>

          <button
            type="button"
            className="admin-logout"
            onClick={() => {
              localStorage.removeItem("bp_admin_token");
              navigate("/admin/login");
            }}
          >
            Logout
          </button>
        </aside>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>

      <div className="admin-mobile-tabs">
        <NavLink to="/admin" end>
          Dashboard
        </NavLink>
        <NavLink to="/admin/orders">Orders</NavLink>
        <NavLink to="/admin/products">Products</NavLink>
        <NavLink to="/admin/analytics">Analytics</NavLink>
        <NavLink to="/admin/customers">More</NavLink>
      </div>
    </div>
  );
}
