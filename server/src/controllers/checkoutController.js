import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { applyShwaryPayloadToOrder, findOrderByShwaryTransaction } from "../services/orderPayment.js";
import {
  getTransaction,
  initiatePayment,
  isShwaryConfigured,
  isShwarySandbox,
} from "../services/shwaryService.js";
import { getCountryMeta, isValidE164, toE164 } from "../utils/phone.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildOrderItems(cartItems) {
  return cartItems.map((item) => ({
    productId: item.productId || item._id,
    name: item.name,
    qty: Number(item.qty),
    price: Number(item.price),
  }));
}

export async function createCheckout(req, res, next) {
  try {
    if (!isShwaryConfigured()) {
      return res.status(503).json({
        message: "Payments are not configured yet. Add SHWARY_MERCHANT_KEY to server/.env.",
      });
    }

    const {
      customerName,
      email,
      phone,
      address,
      city,
      country,
      countryCode = "RW",
      items,
      utmSource,
      utmCampaign,
    } = req.body || {};

    if (!customerName || !email || !phone || !address || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Missing checkout fields." });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: "Invalid email address." });
    }

    const e164 = toE164(phone, countryCode);
    if (!isValidE164(e164)) {
      return res.status(400).json({ message: "Phone number must be valid E.164 format." });
    }

    const orderItems = buildOrderItems(items);
    const productIds = orderItems.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== productIds.length) {
      return res.status(400).json({ message: "One or more products are invalid." });
    }

    for (const item of orderItems) {
      const product = products.find((entry) => String(entry._id) === String(item.productId));
      if (!product) continue;
      if (product.stock < item.qty) {
        return res.status(400).json({ message: `${product.name} is out of stock.` });
      }
    }

    const total = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    if (total < 100) {
      return res.status(400).json({ message: "Order total must be at least 100 RWF." });
    }

    const meta = getCountryMeta(countryCode);
    const order = await Order.create({
      customerName: customerName.trim(),
      email: email.trim().toLowerCase(),
      phone: e164,
      address: address.trim(),
      city: city?.trim() || "Kigali",
      country: country?.trim() || "Rwanda",
      countryCode: countryCode.toUpperCase(),
      currency: meta.currency,
      customerId: req.customer?.id || null,
      status: "pending_payment",
      paymentStatus: "pending",
      items: orderItems,
      total,
      utmSource: utmSource || null,
      utmCampaign: utmCampaign || null,
      stockReserved: false,
    });

    let shwaryResponse;
    try {
      shwaryResponse = await initiatePayment({
        amount: total,
        clientPhoneNumber: e164,
        countryCode: countryCode.toUpperCase(),
      });
    } catch (error) {
      order.status = "failed";
      order.paymentStatus = "failed";
      order.paymentFailureReason = error.message;
      await order.save();
      return res.status(error.status || 502).json({
        message: error.message,
        orderId: order._id,
      });
    }

    await applyShwaryPayloadToOrder(order, shwaryResponse);

    return res.status(201).json({
      order: await Order.findById(order._id),
      shwary: shwaryResponse,
      sandbox: isShwarySandbox(),
    });
  } catch (error) {
    next(error);
  }
}

export async function shwaryCallback(req, res) {
  res.status(200).json({ received: true });

  const payload = req.body || {};
  const transactionId = payload.id || payload.transactionId || payload._id;
  if (!transactionId) return;

  setImmediate(async () => {
    try {
      const order = await findOrderByShwaryTransaction(payload);
      if (!order) {
        console.warn("Shwary callback: no order for transaction", transactionId);
        return;
      }

      await applyShwaryPayloadToOrder(order, payload);
    } catch (error) {
      console.error("Shwary callback processing error:", error);
    }
  });
}

export async function getPaymentStatus(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (!order.shwaryTransactionId) {
      return res.json({ order, shwary: null, isSandbox: isShwarySandbox() });
    }

    if (!isShwaryConfigured()) {
      return res.json({ order, shwary: null, isSandbox: isShwarySandbox(), syncError: "Shwary not configured." });
    }

    try {
      const shwary = await getTransaction(order.shwaryTransactionId);
      const updated = await applyShwaryPayloadToOrder(order, shwary);
      return res.json({ order: updated, shwary, isSandbox: isShwarySandbox() });
    } catch (error) {
      return res.json({ order, shwary: null, isSandbox: isShwarySandbox(), syncError: error.message });
    }
  } catch (error) {
    next(error);
  }
}

export async function getOrderById(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found." });
    return res.json(order);
  } catch (error) {
    next(error);
  }
}
