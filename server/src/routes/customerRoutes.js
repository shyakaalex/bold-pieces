import { Router } from "express";

import {
  getCustomerOrders,
  loginCustomer,
  registerCustomer,
} from "../controllers/customerController.js";
import { requireCustomer } from "../middleware/customerAuth.js";
import { authLimiter } from "../middleware/rateLimit.js";

const router = Router();

router.post("/register", authLimiter, registerCustomer);
router.post("/login", authLimiter, loginCustomer);
router.get("/orders", requireCustomer, getCustomerOrders);

export default router;
