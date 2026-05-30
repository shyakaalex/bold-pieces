import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, default: "Kigali", trim: true },
    country: { type: String, default: "Rwanda", trim: true },
    countryCode: { type: String, default: "RW", uppercase: true, trim: true },
    currency: { type: String, default: "RWF", uppercase: true, trim: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null },
    status: {
      type: String,
      enum: [
        "pending_payment",
        "paid",
        "failed",
        "cancelled",
        "Pending",
        "Shipped",
        "Done",
      ],
      default: "pending_payment",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "submitted", "completed", "failed", "cancelled"],
      default: "pending",
    },
    shwaryTransactionId: { type: String, default: null, index: true },
    shwaryTxHash: { type: String, default: null },
    paymentFailureReason: { type: String, default: null },
    items: { type: [orderItemSchema], required: true },
    total: { type: Number, required: true, min: 0 },
    utmSource: { type: String, default: null },
    utmCampaign: { type: String, default: null },
    stockReserved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
