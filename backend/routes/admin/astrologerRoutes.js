const router = require("express").Router();
const supabase = require("../../config/supabase");
const { requireAdminAuth, requireSuperAdmin } = require("../../middleware/adminAuth");

// GET /api/admin/astrologers
router.get("/", requireAdminAuth, async (req, res) => {
  try {
    const { data, error } = await supabase.from("astrologer_applications").select("*").eq("status", "ACTIVATED");
    if (error) throw error;
    res.json({ success: true, astrologers: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/astrologers/:id/status
router.patch("/:id/status", requireAdminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const { data, error } = await supabase
      .from("astrologer_applications")
      .update({ status })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, astrologer: data });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/admin/astrologers/:id
router.delete("/:id", requireSuperAdmin, async (req, res) => {
  try {
    const { error } = await supabase.from("astrologer_applications").delete().eq("id", req.params.id);
    if (error) throw error;
    res.json({ success: true, message: "Astrologer deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
