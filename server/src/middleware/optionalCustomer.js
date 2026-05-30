import jwt from "jsonwebtoken";

export function optionalCustomer(req, _res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return next();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "change-me");
    if (payload.role === "customer") {
      req.customer = payload;
    }
  } catch {
    // ignore invalid customer token for optional auth
  }
  return next();
}
