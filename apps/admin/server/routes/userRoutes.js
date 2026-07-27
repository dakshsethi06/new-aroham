import express from "express";
import { getAllUsers, updateUserStatus, deleteUser } from "../services/userService.js";
import { requireAdminAuth, requireSuperAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

// GET /api/admin/users
router.get("/", requireAdminAuth, async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/users/:id/status
router.patch("/:id/status", requireAdminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const user = await updateUserStatus(req.params.id, status);
    res.json({ success: true, user, message: `User status updated to ${status}` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/admin/users/:id
router.delete("/:id", requireSuperAdmin, async (req, res) => {
  try {
    await deleteUser(req.params.id);
    res.json({ success: true, message: "User deleted from database successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
