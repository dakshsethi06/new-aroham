const router = require("express").Router();
const { loginAdmin, registerAdmin } = require("../../services/admin/authService");
const { requireAdminAuth } = require("../../middleware/adminAuth");

// POST /api/admin/auth/login
router.post("/login", async (req, res) => {
  try {
    const { mobileNumber, mpin } = req.body;
    const result = await loginAdmin(mobileNumber, mpin);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/admin/auth/register
router.post("/register", async (req, res) => {
  try {
    const result = await registerAdmin(req.body);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/admin/auth/me
router.get("/me", requireAdminAuth, (req, res) => {
  res.json({ success: true, admin: req.admin });
});

module.exports = router;
