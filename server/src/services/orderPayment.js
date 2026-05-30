import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { mapShwaryStatusToOrder } from "./shwaryService.js";

export function extractTransactionId(payload) {
  return String(payload?.id || payload?.transactionId || payload?._id || "");
}

export async function reserveStockForOrder(order) {
  if (order.stockReserved) return;
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.qty } });
  }
  order.stockReserved = true;
  await order.save();
}

export async function applyShwaryPayloadToOrder(order, payload) {
  const transactionId = extractTransactionId(payload);
  const normalizedStatus = String(payload?.status || "").toLowerCase();
  const mapped = mapShwaryStatusToOrder(payload.status);
  const previousPayment = order.paymentStatus;

  if (transactionId) {
    order.shwaryTransactionId = transactionId;
  }
  order.paymentStatus = mapped.paymentStatus;

  if (normalizedStatus === "completed") {
    order.status = "Pending";
  } else {
    order.status = mapped.status;
  }

  if (payload?.failureReason) {
    order.paymentFailureReason = payload.failureReason;
  }
  if (payload?.txHash) {
    order.shwaryTxHash = payload.txHash;
  }

  await order.save();

  if (order.paymentStatus === "completed" && previousPayment !== "completed") {
    await reserveStockForOrder(order);
  }

  return order;
}

export async function findOrderByShwaryTransaction(payload) {
  const transactionId = extractTransactionId(payload);
  if (!transactionId) return null;
  return Order.findOne({ shwaryTransactionId: transactionId });
}
