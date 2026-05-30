/** Format amounts stored as whole RWF (no cents). */
export function formatRwf(amount) {
  const value = Math.round(Number(amount || 0));
  return `RWF ${value.toLocaleString("en-RW", { maximumFractionDigits: 0 })}`;
}

export function formatPrice(amount, currency = "RWF") {
  if (currency === "RWF") return formatRwf(amount);
  return `${currency} ${Number(amount || 0).toLocaleString()}`;
}

export function formatOrderId(id) {
  return `#BP${String(id).slice(-6).toUpperCase()}`;
}

export function productImage(product, index = 0, fallbacks = []) {
  if (product?.image) return product.image;
  return fallbacks[index % fallbacks.length] || "/assets/products/jw1.png";
}

export const PRODUCT_FALLBACKS = [
  "/assets/products/jw1.png",
  "/assets/products/jw 2.png",
  "/assets/products/jw 3.png",
  "/assets/products/jw5.png",
  "/assets/products/jw6.png",
  "/assets/products/jw7.png",
];

export const CATEGORIES = ["All", "Necklaces", "Bracelets", "Earrings", "Rings"];

export const COUNTRY_OPTIONS = [
  { code: "RW", label: "Rwanda", currency: "RWF", prefix: "+250" },
  { code: "KE", label: "Kenya", currency: "KES", prefix: "+254" },
  { code: "UG", label: "Uganda", currency: "UGX", prefix: "+256" },
  { code: "CD", label: "DR Congo", currency: "CDF", prefix: "+243" },
];

export function readUtmParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get("utm_source") || params.get("source") || null,
    utmCampaign: params.get("utm_campaign") || params.get("campaign") || null,
  };
}
