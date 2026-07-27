const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "aroham_admin_jwt_secret_key_2026";
const SUPER_ADMIN_MOBILES = ["7505298939", "8000153840", "8619037218"];

function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing authentication token" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized: Invalid or expired admin session token" });
  }
}

function requireSuperAdmin(req, res, next) {
  requireAdminAuth(req, res, () => {
    const mobile = req.admin?.mobile || req.admin?.mobileNumber;
    const role = req.admin?.role;

    const isSuperAdmin = role === "SUPER_ADMIN" || SUPER_ADMIN_MOBILES.includes(mobile);

    if (!isSuperAdmin) {
      return res.status(403).json({
        error: "Forbidden: Delete operations are restricted to Super Admins only."
      });
    }
    next();
  });
}

function generateAdminToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}

module.exports = {
  requireAdminAuth,
  requireSuperAdmin,
  generateAdminToken
};
