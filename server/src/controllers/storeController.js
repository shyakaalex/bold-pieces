import { NewsletterSubscriber } from "../models/NewsletterSubscriber.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function listProducts(req, res, next) {
  try {
    const { category, q } = req.query;
    const filter = {};

    if (category && category !== "All") {
      filter.category = category;
    }

    if (q) {
      const term = String(q).trim();
      filter.$or = [
        { name: { $regex: term, $options: "i" } },
        { category: { $regex: term, $options: "i" } },
        { description: { $regex: term, $options: "i" } },
      ];
    }

    const products = await Product.find(filter).sort({ createdAt: 1 });
    res.json(products);
  } catch (error) {
    next(error);
  }
}

export async function getProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found." });
    return res.json(product);
  } catch (error) {
    next(error);
  }
}

export async function subscribeNewsletter(req, res, next) {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: "Invalid email address." });
    }
    const existing = await NewsletterSubscriber.findOne({ email });
    if (existing) {
      return res.json({ message: "Already subscribed." });
    }
    await NewsletterSubscriber.create({ email });
    return res.status(201).json({ message: "Subscription successful." });
  } catch (error) {
    next(error);
  }
}

export async function createOrder(req, res, next) {
  try {
    const { customerName, email, address, phone, city, country, countryCode, items } = req.body || {};
    if (!customerName || !email || !address || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Missing checkout fields." });
    }

    const orderItems = items.map((item) => ({
      productId: item.productId || item._id,
      name: item.name,
      qty: Number(item.qty),
      price: Number(item.price),
    }));

    const total = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0);

    const order = await Order.create({
      customerName: customerName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || "",
      address: address.trim(),
      city: city || "Kigali",
      country: country || "Rwanda",
      countryCode: (countryCode || "RW").toUpperCase(),
      currency: "RWF",
      status: "Pending",
      paymentStatus: "completed",
      items: orderItems,
      total,
    });

    return res.status(201).json(order);
  } catch (error) {
    next(error);
  }
}
