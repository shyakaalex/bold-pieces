const SHWARY_BASE = "https://api.shwary.com/api/v1";
const PLACEHOLDER_KEY = "paste-your-key-here";

function shwaryHeaders() {
  const merchantId = process.env.SHWARY_MERCHANT_ID;
  const merchantKey = process.env.SHWARY_MERCHANT_KEY;

  if (!merchantId || !merchantKey || merchantKey === PLACEHOLDER_KEY) {
    const error = new Error(
      "Shwary is not configured. Add SHWARY_MERCHANT_KEY to server/.env."
    );
    error.status = 503;
    throw error;
  }

  return {
    "Content-Type": "application/json",
    "x-merchant-id": merchantId,
    "x-merchant-key": merchantKey,
  };
}

export function isShwaryConfigured() {
  const key = process.env.SHWARY_MERCHANT_KEY;
  return Boolean(process.env.SHWARY_MERCHANT_ID && key && key !== PLACEHOLDER_KEY);
}

export function isShwarySandbox() {
  return process.env.SHWARY_SANDBOX === "true";
}

function parseShwaryError(response, data) {
  const fallback = data?.message || data?.error || `Shwary request failed (${response.status})`;

  if (response.status === 401) {
    return "Shwary rejected your credentials. Check SHWARY_MERCHANT_ID and SHWARY_MERCHANT_KEY.";
  }
  if (response.status === 400) {
    return data?.message || "Invalid payment details. Check amount and phone number.";
  }
  if (response.status === 404) {
    return "Shwary could not find the client or merchant record.";
  }
  if (response.status === 502) {
    return "Mobile Money gateway is temporarily unavailable. Please try again.";
  }
  return fallback;
}

export async function initiatePayment({ amount, clientPhoneNumber, countryCode }) {
  const sandbox = isShwarySandbox();
  const path = sandbox
    ? `/merchants/payment/sandbox/${countryCode}`
    : `/merchants/payment/${countryCode}`;

  const body = {
    amount: Math.max(100, Math.round(amount)),
    clientPhoneNumber,
  };

  if (process.env.SHWARY_CALLBACK_URL) {
    body.callbackUrl = process.env.SHWARY_CALLBACK_URL;
  }

  const response = await fetch(`${SHWARY_BASE}${path}`, {
    method: "POST",
    headers: shwaryHeaders(),
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = parseShwaryError(response, data);
    const error = new Error(message);
    error.status = response.status >= 500 ? 502 : response.status;
    error.details = data;
    throw error;
  }

  return { ...data, isSandbox: sandbox };
}

export async function getTransaction(transactionId) {
  const response = await fetch(`${SHWARY_BASE}/merchants/transactions/${transactionId}`, {
    method: "GET",
    headers: shwaryHeaders(),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = parseShwaryError(response, data);
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}

export function mapShwaryStatusToOrder(shwaryStatus) {
  const normalized = String(shwaryStatus || "").toLowerCase();
  if (normalized === "completed") {
    return { paymentStatus: "completed", status: "paid" };
  }
  if (normalized === "failed") {
    return { paymentStatus: "failed", status: "failed" };
  }
  if (normalized === "cancelled") {
    return { paymentStatus: "cancelled", status: "cancelled" };
  }
  if (normalized === "submitted") {
    return { paymentStatus: "submitted", status: "pending_payment" };
  }
  return { paymentStatus: "pending", status: "pending_payment" };
}
