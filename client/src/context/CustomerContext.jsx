import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { customerClient } from "../lib/api";

const CustomerContext = createContext(null);

export function CustomerProvider({ children }) {
  const [customer, setCustomer] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("bp_customer") || "null");
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("bp_customer_token") || "");

  useEffect(() => {
    if (customer) localStorage.setItem("bp_customer", JSON.stringify(customer));
    else localStorage.removeItem("bp_customer");
  }, [customer]);

  useEffect(() => {
    if (token) localStorage.setItem("bp_customer_token", token);
    else localStorage.removeItem("bp_customer_token");
  }, [token]);

  const client = useMemo(() => customerClient(token), [token]);

  const login = async (email, password) => {
    const response = await client.post("/login", { email, password });
    setToken(response.data.token);
    setCustomer(response.data.customer);
    return response.data;
  };

  const register = async (name, email, password, phone) => {
    const response = await client.post("/register", { name, email, password, phone });
    setToken(response.data.token);
    setCustomer(response.data.customer);
    return response.data;
  };

  const logout = () => {
    setToken("");
    setCustomer(null);
  };

  const value = { customer, token, login, register, logout, client };

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>;
}

export function useCustomer() {
  const context = useContext(CustomerContext);
  if (!context) throw new Error("useCustomer must be used within CustomerProvider");
  return context;
}
