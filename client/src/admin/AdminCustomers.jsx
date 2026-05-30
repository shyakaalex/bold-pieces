import { useEffect, useState } from "react";

import { adminClient } from "../lib/api";

export default function AdminCustomers() {
  const token = localStorage.getItem("bp_admin_token");
  const client = adminClient(token);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    client.get("/customers").then((r) => setCustomers(r.data));
  }, [client]);

  return (
    <>
      <div className="admin-topbar">
        <h1>Customers</h1>
      </div>
      <article className="admin-panel">
        <div className="admin-table">
          <div className="admin-table-row admin-table-head">
            <span>Name</span>
            <span>Email</span>
            <span>Phone</span>
            <span>Joined</span>
          </div>
          {customers.map((customer) => (
            <div key={customer._id} className="admin-table-row">
              <span>{customer.name}</span>
              <span>{customer.email}</span>
              <span>{customer.phone || "—"}</span>
              <span>{new Date(customer.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </article>
    </>
  );
}
