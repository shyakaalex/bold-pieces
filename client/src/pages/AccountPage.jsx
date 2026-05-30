import { useEffect, useState } from "react";

import StoreLayout from "../components/StoreLayout";
import { useCustomer } from "../context/CustomerContext";
import { formatOrderId, formatRwf } from "../utils/format";

export default function AccountPage() {
  const { customer, token, login, register, logout, client } = useCustomer();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    client.get("/orders").then((r) => setOrders(r.data)).catch(() => setOrders([]));
  }, [token, client]);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password, form.phone);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed.");
    }
  };

  if (customer) {
    return (
      <StoreLayout>
        <section className="page-hero">
          <h1>My account</h1>
          <p>Welcome, {customer.name}</p>
          <button type="button" className="primary-btn" onClick={logout}>
            Sign out
          </button>
          <h2>Order history</h2>
          {orders.length === 0 ? (
            <p>No orders yet.</p>
          ) : (
            orders.map((order) => (
              <article key={order._id} className="order-history-row">
                <strong>{formatOrderId(order._id)}</strong>
                <span>{formatRwf(order.total)}</span>
                <span>{order.status}</span>
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              </article>
            ))
          )}
        </section>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <section className="page-hero account-page">
        <h1>{mode === "login" ? "Sign in" : "Create account"}</h1>
        <form className="checkout-form account-form" onSubmit={submit}>
          {mode === "register" ? (
            <label>
              Name
              <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
            </label>
          ) : null}
          <label>
            Email
            <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
          </label>
          {mode === "register" ? (
            <label>
              Phone
              <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="+250780000000" />
            </label>
          ) : null}
          <label>
            Password
            <input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required />
          </label>
          {error ? <p className="error-text">{error}</p> : null}
          <button type="submit" className="primary-btn">
            {mode === "login" ? "Sign in" : "Register"}
          </button>
        </form>
        <button type="button" className="text-btn" onClick={() => setMode(mode === "login" ? "register" : "login")}>
          {mode === "login" ? "Need an account? Register" : "Already have an account? Sign in"}
        </button>
      </section>
    </StoreLayout>
  );
}
