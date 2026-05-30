import jwt from "jsonwebtoken";

export function requireCustomer(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.CUSTOMER_JWT_SECRET || process.env.JWT_SECRET || "change-me"
    );
    if (payload.role !== "customer") {
      return res.status(401).json({ message: "Invalid token." });
    }
    req.customer = payload;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid token." });
  }
}
