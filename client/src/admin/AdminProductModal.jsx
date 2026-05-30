import { useEffect, useMemo, useState } from "react";

import { IconClose } from "../components/Icons";
import { adminClient } from "../lib/api";
import { CATEGORIES, formatRwf } from "../utils/format";
import {
  getProductSku,
  getProductStatusBadge,
  getProductSubtitle,
  getStockStatus,
} from "../utils/productDisplay";

const EMPTY_FORM = {
  name: "",
  price: "",
  category: "Necklaces",
  badge: "NEW",
  image: "/assets/products/jw1.png",
  stock: "10",
  description: "",
  material: "Sterling Silver",
  sku: "",
  active: true,
};

export default function AdminProductModal({ open, product, onClose, onSaved, client }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEdit = Boolean(product?._id);

  useEffect(() => {
    if (!open) return;
    setError("");
    setFile(null);
    if (product) {
      setForm({
        name: product.name || "",
        price: String(product.price ?? ""),
        category: product.category || "Necklaces",
        badge: product.badge || "NEW",
        image: product.image || "/assets/products/jw1.png",
        stock: String(product.stock ?? 0),
        description: product.description || "",
        material: product.material || "Sterling Silver",
        sku: product.sku || "",
        active: product.active !== false,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, product]);

  if (!open) return null;

  const uploadImage = async () => {
    if (!file) return form.image;
    const body = new FormData();
    body.append("image", file);
    const response = await client.post("/upload", body, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.image;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const image = await uploadImage();
      const payload = {
        ...form,
        image,
        price: Number(form.price),
        stock: Number(form.stock),
        currency: "RWF",
      };
      if (isEdit) {
        await client.patch(`/products/${product._id}`, payload);
      } else {
        await client.post("/products", payload);
      }
      onSaved();
      onClose();
    } catch {
      setError("Could not save product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button type="button" className="product-modal-backdrop" aria-label="Close" onClick={onClose} />
      <div className="product-modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
        <button type="button" className="product-modal__close" onClick={onClose} aria-label="Close">
          <IconClose size={20} />
        </button>
        <h2 id="product-modal-title">{isEdit ? "Edit Product" : "Add Product"}</h2>
        <form className="product-modal__form" onSubmit={handleSubmit}>
          <label>
            Name
            <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
          </label>
          <div className="product-modal__row">
            <label>
              Price (RWF)
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                required
              />
            </label>
            <label>
              Stock
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))}
                required
              />
            </label>
          </div>
          <div className="product-modal__row">
            <label>
              Category
              <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.filter((c) => c !== "All").map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label>
              Badge
              <select value={form.badge} onChange={(e) => setForm((p) => ({ ...p, badge: e.target.value }))}>
                <option>NEW</option>
                <option>BESTSELLER</option>
                <option>LIMITED</option>
              </select>
            </label>
          </div>
          <div className="product-modal__row">
            <label>
              SKU
              <input
                value={form.sku}
                onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))}
                placeholder="Auto-generated if empty"
              />
            </label>
            <label>
              Material
              <input value={form.material} onChange={(e) => setForm((p) => ({ ...p, material: e.target.value }))} />
            </label>
          </div>
          <label>
            Description
            <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </label>
          <label>
            Image
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
          <label className="product-modal__check">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
            />
            Active on storefront
          </label>
          {error ? <p className="error-text">{error}</p> : null}
          <div className="product-modal__actions">
            <button type="button" className="btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
