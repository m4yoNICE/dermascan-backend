export const checkAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: No user info" });
    }

    if (!req.user.role.id || req.user.role.id !== 1) {
      console.log("checkAdmin: Non-admin access attempt:", req.user.role.id);
      return res.status(403).json({ error: "Access denied: Admins only" });
    }

    next(); // user is admin, proceed
  } catch (err) {
    console.error("checkAdmin error:", err);
    res.status(500).json({ error: "Server error in admin check" });
  }
};