import express from "express";
import { loginAdmin, registerAdmin } from "../services/authService.js";
import { sendOtp, verifyOtp } from "../services/otpService.js";
import { requireAdminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

// POST /api/admin/auth/send-otp
router.post("/send-otp", async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    const result = await sendOtp(mobileNumber);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/admin/auth/verify-otp
router.post("/verify-otp", async (req, res) => {
  try {
    const { mobileNumber, otp } = req.body;
    await verifyOtp(mobileNumber, otp);
    res.json({ success: true, message: "OTP verified successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

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

export default router;

