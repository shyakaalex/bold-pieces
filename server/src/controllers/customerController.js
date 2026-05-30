import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { Customer } from "../models/Customer.js";
import { Order } from "../models/Order.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function signCustomerToken(customer) {
  return jwt.sign(
    { role: "customer", id: customer._id, email: customer.email, name: customer.name },
    process.env.CUSTOMER_JWT_SECRET || process.env.JWT_SECRET || "change-me",
    { expiresIn: "30d" }
  );
}

export async function registerCustomer(req, res, next) {
  try {
    const { name, email, password, phone } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: "Invalid email address." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const existing = await Customer.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const customer = await Customer.create({
      name: name.trim(),
      email: email.toLowerCase(),
      passwordHash,
      phone: phone || "",
    });

    const token = signCustomerToken(customer);
    return res.status(201).json({
      token,
      customer: { id: customer._id, name: customer.name, email: customer.email, phone: customer.phone },
    });
  } catch (error) {
    next(error);
  }
}

export async function loginCustomer(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const customer = await Customer.findOne({ email: email.toLowerCase() });
    if (!customer) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const valid = await bcrypt.compare(password, customer.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = signCustomerToken(customer);
    return res.json({
      token,
      customer: { id: customer._id, name: customer.name, email: customer.email, phone: customer.phone },
    });
  } catch (error) {
    next(error);
  }
}

export async function getCustomerOrders(req, res, next) {
  try {
    const orders = await Order.find({ email: req.customer.email }).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    next(error);
  }
}

export async function listCustomers(_req, res, next) {
  try {
    const customers = await Customer.find().select("-passwordHash").sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    next(error);
  }
}
