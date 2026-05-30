import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";

import { connectDatabase } from "./config/db.js";
import { Product } from "./models/Product.js";
import adminRoutes from "./routes/adminRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";
import { productsSeed } from "./seed/productsSeed.js";
import { isShwaryConfigured, isShwarySandbox } from "./services/shwaryService.js";

dotenv.config();

if (process.env.JWT_SECRET === "dev-secret" || process.env.JWT_SECRET === "change-me") {
  console.warn("WARNING: JWT_SECRET is using the insecure default. Change it before deploying.");
}
if (process.env.ADMIN_PASSWORD === "admin123") {
  console.warn("WARNING: ADMIN_PASSWORD is using the insecure default. Change it before deploying.");
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 5001;

const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";
app.use(
  cors({
    origin: allowedOrigin === "*" ? true : allowedOrigin,
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    shwaryConfigured: isShwaryConfigured(),
    shwarySandbox: isShwarySandbox(),
    callbackUrl: process.env.SHWARY_CALLBACK_URL || null,
  });
});

app.use("/api", storeRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/admin", adminRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  if (error.message === "Only image uploads are allowed.") {
    return res.status(400).json({ message: error.message });
  }
  res.status(500).json({ message: "Internal server error." });
});

async function ensureCatalog() {
  const count = await Product.countDocuments();
  const missingStock = await Product.countDocuments({
    $or: [{ stock: { $exists: false } }, { image: { $exists: false } }, { image: null }, { image: "" }],
  });
  const legacyUsdPrices = await Product.countDocuments({ price: { $lt: 10000 } });
  const wrongCurrency = await Product.countDocuments({
    $or: [{ currency: { $exists: false } }, { currency: { $ne: "RWF" } }],
  });

  if (count === 0 || missingStock > 0 || legacyUsdPrices > 0 || wrongCurrency > 0) {
    await Product.deleteMany({});
    await Product.insertMany(productsSeed.map((product) => ({ ...product, currency: "RWF" })));
    console.log("Catalog synced with RWF prices.");
  }
}

async function start() {
  await connectDatabase(process.env.MONGODB_URI);
  await ensureCatalog();

  await new Promise((resolve, reject) => {
    const server = app.listen(port, "0.0.0.0", () => {
      console.log(`API listening on http://localhost:${port}`);
      console.log(
        `Shwary: ${isShwaryConfigured() ? (isShwarySandbox() ? "sandbox mode" : "live mode") : "NOT CONFIGURED — set SHWARY_MERCHANT_KEY"}`
      );
      if (process.env.SHWARY_CALLBACK_URL) {
        console.log(`Shwary callback: ${process.env.SHWARY_CALLBACK_URL}`);
      }
      resolve(server);
    });
    server.on("error", reject);
  });
}

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
