import jwt from "jsonwebtoken";

import { Customer } from "../models/Customer.js";
import { NewsletterSubscriber } from "../models/NewsletterSubscriber.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
function periodBounds(daysAgo, daysLength) {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setDate(start.getDate() - daysAgo - daysLength + 1);
  start.setHours(0, 0, 0, 0);
  const prevEnd = new Date(start);
  prevEnd.setMilliseconds(-1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - daysLength + 1);
  prevStart.setHours(0, 0, 0, 0);
  return { start, end, prevStart, prevEnd };
}

function paidOrders(orders) {
  return orders.filter(
    (order) =>
      order.paymentStatus === "completed" ||
      ["paid", "Pending", "Shipped", "Done"].includes(order.status)
  );
}

function percentChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export async function adminLogin(req, res) {
  const { email, password } = req.body || {};
  const adminEmail = process.env.ADMIN_EMAIL || "admin@boldpieces.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  if (email !== adminEmail || password !== adminPassword) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const token = jwt.sign(
    { role: "admin", email: adminEmail },
    process.env.JWT_SECRET || "change-me",
    { expiresIn: "8h" }
  );

  return res.json({ token });
}

export async function adminProductsSummary(_req, res, next) {
  try {
    const now = new Date();
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const [allProducts, prevProducts] = await Promise.all([
      Product.find(),
      Product.find({ createdAt: { $lte: prevMonthEnd } }),
    ]);

    const metrics = (list) => ({
      total: list.length,
      active: list.filter((p) => p.active !== false).length,
      outOfStock: list.filter((p) => p.stock === 0).length,
      lowStock: list.filter((p) => p.stock > 0 && p.stock <= 5).length,
    });

    const current = metrics(allProducts);
    const previous = metrics(prevProducts);

    return res.json({
      totalProducts: { value: current.total, change: percentChange(current.total, previous.total) },
      activeProducts: { value: current.active, change: percentChange(current.active, previous.active) },
      outOfStock: { value: current.outOfStock, change: percentChange(current.outOfStock, previous.outOfStock) },
      lowStock: { value: current.lowStock, change: percentChange(current.lowStock, previous.lowStock) },
    });
  } catch (error) {
    next(error);
  }
}

export async function adminListProducts(req, res, next) {
  try {
    const { q, category, status, stock } = req.query;
    const filter = {};

    if (category && category !== "all") {
      filter.category = category;
    }

    if (status === "active") {
      filter.active = { $ne: false };
    } else if (status === "inactive") {
      filter.active = false;
    }

    if (stock === "out") {
      filter.stock = 0;
    } else if (stock === "low") {
      filter.stock = { $gt: 0, $lte: 5 };
    } else if (stock === "in") {
      filter.stock = { $gt: 5 };
    }

    if (q && String(q).trim()) {
      const term = String(q).trim();
      filter.$or = [
        { name: { $regex: term, $options: "i" } },
        { sku: { $regex: term, $options: "i" } },
        { category: { $regex: term, $options: "i" } },
        { material: { $regex: term, $options: "i" } },
      ];
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    next(error);
  }
}

export async function adminCreateProduct(req, res, next) {
  try {
    const product = await Product.create({ ...req.body, currency: "RWF" });
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
}

export async function adminUpdateProduct(req, res, next) {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, currency: "RWF" },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Product not found." });
    res.json(updated);
  } catch (error) {
    next(error);
  }
}

export async function adminDeleteProduct(req, res, next) {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Product not found." });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
}

export async function adminUploadProductImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded." });
    }
    const imagePath = `/uploads/products/${req.file.filename}`;
    return res.json({ image: imagePath });
  } catch (error) {
    next(error);
  }
}

const ORDER_STATUS_GROUPS = {
  Pending: ["pending_payment", "Pending"],
  Processing: ["Shipped", "paid", "submitted"],
  Delivered: ["Done"],
  Cancelled: ["cancelled", "failed"],
};

export async function adminOrdersSummary(_req, res, next) {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(monthStart.getTime() - 1);

    const [currentOrders, previousOrders, pendingCount] = await Promise.all([
      Order.find({ createdAt: { $gte: monthStart } }),
      Order.find({ createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd } }),
      Order.countDocuments({ status: { $in: ORDER_STATUS_GROUPS.Pending } }),
    ]);

    const currentPaid = paidOrders(currentOrders);
    const previousPaid = paidOrders(previousOrders);
    const currentRevenue = currentPaid.reduce((sum, o) => sum + o.total, 0);
    const previousRevenue = previousPaid.reduce((sum, o) => sum + o.total, 0);
    const currentAov = currentPaid.length ? currentRevenue / currentPaid.length : 0;
    const previousAov = previousPaid.length ? previousRevenue / previousPaid.length : 0;

    return res.json({
      totalOrders: { value: currentOrders.length, change: percentChange(currentOrders.length, previousOrders.length) },
      totalRevenue: { value: currentRevenue, change: percentChange(currentRevenue, previousRevenue) },
      pendingOrders: {
        value: pendingCount,
        share: currentOrders.length ? (pendingCount / currentOrders.length) * 100 : 0,
      },
      averageOrderValue: { value: currentAov, change: percentChange(currentAov, previousAov) },
    });
  } catch (error) {
    next(error);
  }
}

export async function adminListOrders(req, res, next) {
  try {
    const { status, q, payment, from, to } = req.query;
    const filter = {};

    if (status && status !== "All" && ORDER_STATUS_GROUPS[status]) {
      filter.status = { $in: ORDER_STATUS_GROUPS[status] };
    } else if (status && status !== "All") {
      filter.status = status;
    }

    if (q && String(q).trim()) {
      const term = String(q).trim();
      filter.$or = [
        { customerName: { $regex: term, $options: "i" } },
        { email: { $regex: term, $options: "i" } },
        { phone: { $regex: term, $options: "i" } },
      ];
    }

    if (payment && payment !== "all") {
      if (payment === "paid") filter.paymentStatus = "completed";
      else if (payment === "refunded") filter.paymentStatus = { $in: ["failed", "cancelled"] };
      else if (payment === "pending") filter.paymentStatus = { $in: ["pending", "submitted"] };
    }

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
}

export async function adminGetOrder(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found." });
    res.json(order);
  } catch (error) {
    next(error);
  }
}

export async function adminUpdateOrderStatus(req, res, next) {
  try {
    const { status } = req.body;
    const updated = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updated) return res.status(404).json({ message: "Order not found." });
    res.json(updated);
  } catch (error) {
    next(error);
  }
}

export async function adminListNewsletter(_req, res, next) {
  try {
    const subscribers = await NewsletterSubscriber.find().sort({ createdAt: -1 });
    res.json(subscribers);
  } catch (error) {
    next(error);
  }
}

function parseDateRange(query) {
  const { from, to } = query || {};
  if (from && to) {
    const start = new Date(from);
    start.setHours(0, 0, 0, 0);
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    const days = Math.max(1, Math.ceil((end - start) / (24 * 60 * 60 * 1000)));
    const prevEnd = new Date(start);
    prevEnd.setMilliseconds(-1);
    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevStart.getDate() - days + 1);
    prevStart.setHours(0, 0, 0, 0);
    return { start, end, prevStart, prevEnd, days };
  }
  const bounds = periodBounds(0, 7);
  return { start: bounds.start, end: bounds.end, prevStart: bounds.prevStart, prevEnd: bounds.prevEnd, days: 7 };
}

function mapSalesChannel(utmSource) {
  const source = String(utmSource || "").toLowerCase();
  if (source.includes("instagram")) return "Instagram";
  if (source.includes("whatsapp")) return "WhatsApp";
  if (source.includes("tiktok") || source.includes("facebook")) return "Other";
  if (!source) return "Online Store";
  return "Other";
}

function buildDailySeries(orders, start, end, valueFn) {
  const days = [];
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  while (cursor <= end) {
    const dayStart = new Date(cursor);
    const dayEnd = new Date(cursor);
    dayEnd.setHours(23, 59, 59, 999);
    const dayOrders = orders.filter((o) => o.createdAt >= dayStart && o.createdAt <= dayEnd);
    days.push({
      date: dayStart.toISOString().slice(0, 10),
      label: dayStart.toLocaleDateString("en-RW", { month: "short", day: "numeric" }),
      value: valueFn(dayOrders),
      orders: dayOrders.length,
      revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export async function adminAnalyticsReport(req, res, next) {
  try {
    const { start, end, prevStart, prevEnd, days } = parseDateRange(req.query);

    const [currentOrders, previousOrders, products, customers, subscribers] = await Promise.all([
      Order.find({ createdAt: { $gte: start, $lte: end } }),
      Order.find({ createdAt: { $gte: prevStart, $lte: prevEnd } }),
      Product.find(),
      Customer.find(),
      NewsletterSubscriber.find(),
    ]);

    const currentPaid = paidOrders(currentOrders);
    const previousPaid = paidOrders(previousOrders);

    const currentRevenue = currentPaid.reduce((sum, o) => sum + o.total, 0);
    const previousRevenue = previousPaid.reduce((sum, o) => sum + o.total, 0);
    const currentAov = currentPaid.length ? currentRevenue / currentPaid.length : 0;
    const previousAov = previousPaid.length ? previousRevenue / previousPaid.length : 0;

    const checkoutAttempts = currentOrders.length;
    const paymentSuccess = currentPaid.length;
    const previousAttempts = previousOrders.length;
    const previousSuccess = previousPaid.length;
    const conversionRate = checkoutAttempts ? (paymentSuccess / checkoutAttempts) * 100 : 0;
    const previousConversion = previousAttempts ? (previousSuccess / previousAttempts) * 100 : 0;

    const revenueByDay = buildDailySeries(currentPaid, start, end, (dayOrders) =>
      dayOrders.reduce((sum, o) => sum + o.total, 0)
    );
    const ordersByDay = buildDailySeries(currentOrders, start, end, (dayOrders) => dayOrders.length);

    const productMap = new Map(products.map((p) => [String(p._id), p]));
    const productCategoryByName = new Map(products.map((p) => [p.name.toLowerCase(), p.category]));

    const channelTotals = {};
    const topProducts = {};
    const categoryRevenue = {};

    for (const order of currentPaid) {
      const channel = mapSalesChannel(order.utmSource);
      channelTotals[channel] = (channelTotals[channel] || 0) + order.total;

      for (const item of order.items || []) {
        const key = item.name;
        topProducts[key] = topProducts[key] || { name: key, qty: 0, revenue: 0, productId: item.productId };
        topProducts[key].qty += item.qty;
        topProducts[key].revenue += item.price * item.qty;

        const product = productMap.get(String(item.productId));
        const category =
          product?.category || productCategoryByName.get(String(item.name).toLowerCase()) || "Other";
        categoryRevenue[category] = (categoryRevenue[category] || 0) + item.price * item.qty;
      }
    }

    const channelRevenue = Object.entries(channelTotals)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue);
    const totalChannelRevenue = channelRevenue.reduce((sum, c) => sum + c.revenue, 0) || 1;

    const topProductsList = Object.values(topProducts)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5)
      .map((p) => {
        const product = productMap.get(String(p.productId));
        return {
          name: p.name,
          qty: p.qty,
          revenue: p.revenue,
          image: product?.image || "/assets/products/jw1.png",
        };
      });

    const customerEmailsInPeriod = [...new Set(currentPaid.map((o) => o.email.toLowerCase()))];
    const returningEmailsList = await Order.distinct("email", {
      email: { $in: customerEmailsInPeriod },
      createdAt: { $lt: start },
      paymentStatus: "completed",
    });
    const returningCustomers = returningEmailsList.length;
    const newCustomers = Math.max(0, customerEmailsInPeriod.length - returningCustomers);
    const totalCustomers = customers.length + subscribers.length;

    const categoryList = Object.entries(categoryRevenue)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue);

    const peakDay = revenueByDay.reduce(
      (best, day) => (day.revenue > (best?.revenue || 0) ? day : best),
      revenueByDay[0]
    );

    const topChannel = channelRevenue[0];

    const insights = [];
    if (currentRevenue > 0) {
      const revChange = percentChange(currentRevenue, previousRevenue);
      insights.push({
        icon: "trend",
        text: `Revenue is ${revChange >= 0 ? "up" : "down"} ${Math.abs(revChange).toFixed(1)}% compared to the previous period.`,
      });
    }
    if (peakDay?.revenue > 0) {
      insights.push({
        icon: "peak",
        text: `Peak sales occurred on ${peakDay.label} (${peakDay.revenue.toLocaleString()} RWF).`,
      });
    }
    if (topChannel) {
      const share = ((topChannel.revenue / totalChannelRevenue) * 100).toFixed(1);
      insights.push({
        icon: "channel",
        text: `Top channel is ${topChannel.name} (${share}% of sales).`,
      });
    }

    return res.json({
      range: { from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10), days },
      kpis: {
        revenue: { value: currentRevenue, change: percentChange(currentRevenue, previousRevenue) },
        orders: { value: currentOrders.length, change: percentChange(currentOrders.length, previousOrders.length) },
        averageOrderValue: { value: currentAov, change: percentChange(currentAov, previousAov) },
        conversionRate: { value: conversionRate, change: percentChange(conversionRate, previousConversion) },
      },
      revenueByDay,
      ordersByDay,
      maxRevenue: Math.max(...revenueByDay.map((d) => d.revenue), 1),
      maxOrders: Math.max(...ordersByDay.map((d) => d.orders), 1),
      salesByChannel: channelRevenue.map((c) => ({
        ...c,
        percent: (c.revenue / totalChannelRevenue) * 100,
      })),
      topProducts: topProductsList,
      customers: {
        total: totalCustomers,
        returning: returningCustomers,
        new: Math.max(0, newCustomers),
      },
      revenueByCategory: categoryList,
      insights,
    });
  } catch (error) {
    next(error);
  }
}

export async function adminAnalytics(_req, res, next) {
  try {
    const days = 7;
    const { start, end, prevStart, prevEnd } = periodBounds(0, days);

    const [currentOrders, previousOrders] = await Promise.all([
      Order.find({ createdAt: { $gte: start, $lte: end } }),
      Order.find({ createdAt: { $gte: prevStart, $lte: prevEnd } }),
    ]);

    const currentPaid = paidOrders(currentOrders);
    const previousPaid = paidOrders(previousOrders);

    const currentRevenue = currentPaid.reduce((sum, o) => sum + o.total, 0);
    const previousRevenue = previousPaid.reduce((sum, o) => sum + o.total, 0);

    const revenueByDay = [];
    for (let i = days - 1; i >= 0; i -= 1) {
      const dayStart = new Date(end);
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);
      const dayTotal = currentPaid
        .filter((o) => o.createdAt >= dayStart && o.createdAt <= dayEnd)
        .reduce((sum, o) => sum + o.total, 0);
      revenueByDay.push({
        date: dayStart.toISOString().slice(0, 10),
        revenue: dayTotal,
      });
    }

    const maxRevenue = Math.max(...revenueByDay.map((d) => d.revenue), 1);

    const pending = currentOrders.filter((o) => o.status === "Pending" || o.status === "pending_payment").length;
    const processing = currentOrders.filter((o) => o.status === "Shipped").length;
    const delivered = currentOrders.filter((o) => o.status === "Done").length;

    const subscribers = await NewsletterSubscriber.countDocuments({
      createdAt: { $gte: start, $lte: end },
    });
    const prevSubscribers = await NewsletterSubscriber.countDocuments({
      createdAt: { $gte: prevStart, $lte: prevEnd },
    });

    return res.json({
      kpis: {
        revenue: {
          value: currentRevenue,
          change: percentChange(currentRevenue, previousRevenue),
        },
        orders: {
          value: currentOrders.length,
          change: percentChange(currentOrders.length, previousOrders.length),
        },
        customers: {
          value: subscribers,
          change: percentChange(subscribers, prevSubscribers),
        },
      },
      revenueByDay,
      maxRevenue,
      statusCounts: { pending, processing, delivered },
    });
  } catch (error) {
    next(error);
  }
}
