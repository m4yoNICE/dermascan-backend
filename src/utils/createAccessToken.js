import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";

export async function createAccessToken(payload, expiresIn = "7d") {
  return jwt.sign(payload, ENV.JWT_SECRET, { expiresIn });
}
