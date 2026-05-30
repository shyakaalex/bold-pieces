import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "RWF", uppercase: true, trim: true },
    category: { type: String, required: true, trim: true },
    badge: { type: String, default: "NEW" },
    sku: { type: String, trim: true, default: "" },
    material: { type: String, default: "Sterling Silver", trim: true },
    active: { type: Boolean, default: true },
    image: { type: String, required: true },
    description: { type: String, default: "" },
    stock: { type: Number, default: 10, min: 0 },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", category: "text" });

export const Product = mongoose.model("Product", productSchema);
