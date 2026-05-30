import { Navigate, Route, Routes } from "react-router-dom";

import AdminAnalytics from "./AdminAnalytics";
import AdminCustomers from "./AdminCustomers";
import AdminDashboard from "./AdminDashboard";
import AdminLayout from "./AdminLayout";
import AdminLogin from "./AdminLogin";
import AdminOrderDetail from "./AdminOrderDetail";
import AdminOrders from "./AdminOrders";
import AdminProducts from "./AdminProducts";

export default function AdminApp() {
  const token = localStorage.getItem("bp_admin_token");

  return (
    <Routes>
      <Route path="login" element={token ? <Navigate to="/admin" replace /> : <AdminLogin />} />
      <Route
        path="/"
        element={token ? <AdminLayout /> : <Navigate to="/admin/login" replace />}
      >
        <Route index element={<AdminDashboard />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:id" element={<AdminOrderDetail />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="analytics" element={<AdminAnalytics />} />
      </Route>
    </Routes>
  );
}
