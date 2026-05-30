import axios from "axios";

const apiBase = import.meta.env.VITE_API_URL || "";

export const api = axios.create({
  baseURL: `${apiBase}/api`,
});

export function customerClient(token) {
  return axios.create({
    baseURL: `${apiBase}/api/customers`,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export function adminClient(token) {
  return axios.create({
    baseURL: `${apiBase}/api/admin`,
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getCustomerToken() {
  return localStorage.getItem("bp_customer_token");
}

export function checkoutHeaders() {
  const token = getCustomerToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
