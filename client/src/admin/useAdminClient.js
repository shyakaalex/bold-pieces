import { useMemo } from "react";

import { adminClient } from "../lib/api";

export function useAdminClient() {
  const token = localStorage.getItem("bp_admin_token");
  return useMemo(() => adminClient(token), [token]);
}

export function formatOrderId(id) {
  return `#BP${String(id).slice(-6).toUpperCase()}`;
}

export function statusClass(status) {
  if (status === "Done") return "delivered";
  if (status === "Shipped") return "processing";
  return "pending";
}

export function formatDelta(value) {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}
