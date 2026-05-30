import { Router } from "express";

import {
  createCheckout,
  getOrderById,
  getPaymentStatus,
  shwaryCallback,
} from "../controllers/checkoutController.js";
import { getProduct, listProducts, subscribeNewsletter } from "../controllers/storeController.js";
import { optionalCustomer } from "../middleware/optionalCustomer.js";
import { checkoutLimiter } from "../middleware/rateLimit.js";

const router = Router();

router.get("/products", listProducts);
router.get("/products/:id", getProduct);
router.post("/newsletter", subscribeNewsletter);
router.post("/checkout", checkoutLimiter, optionalCustomer, createCheckout);
router.post("/shwary/callback", shwaryCallback);
router.get("/orders/:id", getOrderById);
router.get("/orders/:id/payment-status", getPaymentStatus);

export default router;
