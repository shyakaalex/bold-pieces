import { Router } from "express";

import {
  adminAnalytics,
  adminAnalyticsReport,
  adminCreateProduct,
  adminDeleteProduct,
  adminGetOrder,
  adminListNewsletter,
  adminListOrders,
  adminOrdersSummary,
  adminListProducts,
  adminProductsSummary,
  adminLogin,
  adminUpdateOrderStatus,
  adminUpdateProduct,
  adminUploadProductImage,
} from "../controllers/adminController.js";
import { listCustomers } from "../controllers/customerController.js";
import { requireAdmin } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimit.js";
import { productUpload } from "../middleware/upload.js";

const router = Router();

router.post("/login", authLimiter, adminLogin);

router.get("/products/summary", requireAdmin, adminProductsSummary);
router.get("/products", requireAdmin, adminListProducts);
router.post("/products", requireAdmin, adminCreateProduct);
router.post("/upload", requireAdmin, productUpload.single("image"), adminUploadProductImage);
router.patch("/products/:id", requireAdmin, adminUpdateProduct);
router.delete("/products/:id", requireAdmin, adminDeleteProduct);

router.get("/orders/summary", requireAdmin, adminOrdersSummary);
router.get("/orders", requireAdmin, adminListOrders);
router.get("/orders/:id", requireAdmin, adminGetOrder);
router.patch("/orders/:id/status", requireAdmin, adminUpdateOrderStatus);

router.get("/newsletter", requireAdmin, adminListNewsletter);
router.get("/customers", requireAdmin, listCustomers);
router.get("/analytics/report", requireAdmin, adminAnalyticsReport);
router.get("/analytics", requireAdmin, adminAnalytics);

export default router;
