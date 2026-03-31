import { ENV } from "../config/env.js";
import jwt from "jsonwebtoken";

export function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access Denied" });
  }

  jwt.verify(token, ENV.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or Expired Session" });
    }
    req.user = decoded;
    next();
  });
}
