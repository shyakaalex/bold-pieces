import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { IconSearch } from "../components/Icons";
import ShopNewsletter from "../components/shop/ShopNewsletter";
import ShopProductCard from "../components/shop/ShopProductCard";
import ShopTrustBar from "../components/shop/ShopTrustBar";
import StoreLayout from "../components/StoreLayout";
import { api } from "../lib/api";
import { CATEGORIES } from "../utils/format";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name A–Z" },
];

function sortProducts(list, sortKey) {
  const items = [...list];
  switch (sortKey) {
    case "price-asc":
      return items.sort((a, b) => a.price - b.price);
    case "price-desc":
      return items.sort((a, b) => b.price - a.price);
    case "name":
      return items.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }
}

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "All";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(
    CATEGORIES.includes(initialCategory) ? initialCategory : "All"
  );
  const [searchInput, setSearchInput] = useState(initialQ);
  const [query, setQuery] = useState(initialQ);
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    const cat = searchParams.get("category") || "All";
    const q = searchParams.get("q") || "";
    const nextCat = CATEGORIES.includes(cat) ? cat : "All";
    if (nextCat !== activeFilter) setActiveFilter(nextCat);
    if (q !== query) {
      setQuery(q);
      setSearchInput(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync URL → state only when URL changes
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (activeFilter !== "All") params.set("category", activeFilter);
    if (query.trim()) params.set("q", query.trim());
    const current = searchParams.toString();
    const next = params.toString();
    if (current !== next) setSearchParams(params, { replace: true });
  }, [activeFilter, query, searchParams, setSearchParams]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeFilter !== "All") params.set("category", activeFilter);
    if (query.trim()) params.set("q", query.trim());
    const suffix = params.toString() ? `?${params.toString()}` : "";
    api
      .get(`/products${suffix}`)
      .then((r) => setProducts(r.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [activeFilter, query]);

  const sortedProducts = useMemo(() => sortProducts(products, sort), [products, sort]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setQuery(searchInput.trim());
  };

  return (
    <StoreLayout variant="shop">
      <div className="shop-page">
        <section className="shop-hero">
          <div className="shop-hero__inner">
            <h1>Shop</h1>
            <p>Discover handcrafted pieces made for bold elegance.</p>
            <a href="#shop-products" className="btn-primary">
              Shop now
            </a>
          </div>
        </section>

        <ShopTrustBar />

        <div className="shop-toolbar">
          <div className="shop-toolbar__categories" role="tablist" aria-label="Categories">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={activeFilter === category}
                className={`shop-pill ${activeFilter === category ? "shop-pill--active" : ""}`}
                onClick={() => setActiveFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="shop-toolbar__row">
            <form className="shop-search-field" onSubmit={handleSearchSubmit}>
              <IconSearch size={18} />
              <input
                name="q"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products..."
                aria-label="Search products"
              />
            </form>
            <label className="shop-sort-wrap">
              <span className="visually-hidden">Sort products</span>
              <select
                className="shop-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="Sort products"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <section id="shop-products" className="shop-grid-section" aria-labelledby="shop-grid-heading">
          <h2 id="shop-grid-heading" className="visually-hidden">
            Products
          </h2>
          {loading ? (
            <p className="shop-grid__empty">Loading pieces…</p>
          ) : sortedProducts.length === 0 ? (
            <p className="shop-grid__empty">No products match your search.</p>
          ) : (
            <div className="shop-grid">
              {sortedProducts.map((product, index) => (
                <ShopProductCard key={product._id} product={product} index={index} />
              ))}
            </div>
          )}
        </section>

        <ShopNewsletter />
      </div>
    </StoreLayout>
  );
}
