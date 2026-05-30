const CATEGORY_CODES = {
  Necklaces: "PEN",
  Bracelets: "BRA",
  Earrings: "EAR",
  Rings: "RIN",
};

export function getProductSku(product) {
  if (product?.sku) return product.sku;
  const code = CATEGORY_CODES[product?.category] || "PRD";
  const tail = String(product?._id || "")
    .slice(-3)
    .toUpperCase()
    .padStart(3, "0");
  return `BP-${code}-${tail}`;
}

export function getStockStatus(stock) {
  const qty = Number(stock || 0);
  if (qty === 0) return { label: "Out of stock", tone: "out", qty };
  if (qty <= 5) return { label: "Low stock", tone: "low", qty };
  return { label: "In stock", tone: "in", qty };
}

export function getProductStatusBadge(active) {
  if (active === false) return { label: "Inactive", tone: "inactive" };
  return { label: "Active", tone: "active" };
}

export function getProductSubtitle(product) {
  return product?.material || "Sterling Silver";
}
