const router = require("express").Router();
const supabase = require("../../config/supabase");
const { requireAdminAuth, requireSuperAdmin } = require("../../middleware/adminAuth");

// GET /api/admin/users
router.get("/", requireAdminAuth, async (req, res) => {
  try {
    const { data, error } = await supabase.from("users").select("*");
    if (error) throw error;

    const mapped = (data || []).map(u => ({
      id: u.id,
      fullName: u.full_name || u.name || "Devotee",
      phone: u.phone || "N/A",
      email: u.email || "N/A",
      gender: u.gender || "N/A",
      dob: u.dob || "N/A",
      status: u.status || "ACTIVE",
      createdAt: u.created_at || new Date().toISOString()
    }));

    res.json({ success: true, users: mapped });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/users/:id/status
router.patch("/:id/status", requireAdminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const { data, error } = await supabase
      .from("users")
      .update({ status })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, user: data });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/admin/users/:id
router.delete("/:id", requireSuperAdmin, async (req, res) => {
  try {
    const { error } = await supabase.from("users").delete().eq("id", req.params.id);
    if (error) throw error;
    res.json({ success: true, message: "User profile deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
