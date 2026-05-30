import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "../lib/api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@boldpieces.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const response = await api.post("/admin/login", { email, password });
      localStorage.setItem("bp_admin_token", response.data.token);
      navigate("/admin");
    } catch {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="admin-shell">
      <form className="admin-card" onSubmit={submit}>
        <h1>Admin Login</h1>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        {error ? <p className="error-text">{error}</p> : null}
        <button type="submit" className="primary-btn">
          Sign In
        </button>
      </form>
    </div>
  );
}
