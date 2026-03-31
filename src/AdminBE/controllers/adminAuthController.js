import { loginProcess } from "../services/adminAuthServices.js";

/**
 * Handles admin login endpoint
 *
 * @async
 * @function login
 * @param {Object} req
 * @param {string} req.body.email
 * @param {string} req.body.password
 * @param {Object} res
 * @returns {Promise<void>}
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await loginProcess(email, password);
    if (!result) return res.status(500).json({ error: "Database Error" });

    return res.status(200).json({
      message: "Login successful",
      user: result.user,
      token: result.token,
    });
  } catch (err) {

    if (err.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (err.message === "NOT_ADMIN") {
      return res.status(403).json({ error: "Admins only" });
    }

    return res.status(500).json({ error: "Server error" });
  }
}
