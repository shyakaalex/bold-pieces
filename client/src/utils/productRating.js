/** Stable display rating for storefront cards (until review data is stored on products). */
export function getDisplayRating(product) {
  const seed = String(product._id || product.sku || product.name || "");
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  const abs = Math.abs(hash);
  const reviewCount = 8 + (abs % 42);
  const stars =
    product.badge?.toUpperCase().includes("BEST") ? 5 : 4 + ((abs >> 3) % 2);
  return { stars, reviewCount };
}
