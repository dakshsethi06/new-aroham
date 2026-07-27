import express from "express";
import { getAllAstrologers, updateAstrologerStatus, deleteAstrologer } from "../services/astrologerService.js";
import { requireAdminAuth, requireSuperAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

// GET /api/admin/astrologers
router.get("/", requireAdminAuth, async (req, res) => {
  try {
    const astrologers = await getAllAstrologers();
    res.json({ success: true, astrologers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/astrologers/:id/status
router.patch("/:id/status", requireAdminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const astrologer = await updateAstrologerStatus(req.params.id, status);
    res.json({ success: true, astrologer, message: `Astrologer status updated to ${status}` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/admin/astrologers/:id
router.delete("/:id", requireSuperAdmin, async (req, res) => {
  try {
    await deleteAstrologer(req.params.id);
    res.json({ success: true, message: "Astrologer deleted from database successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
