const router = require("express").Router();
const supabase = require("../../config/supabase");
const { requireAdminAuth, requireSuperAdmin } = require("../../middleware/adminAuth");

function generateSlug(name) {
  return name.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}

// GET /api/admin/products
router.get("/", requireAdminAuth, async (req, res) => {
  try {
    const { data, error } = await supabase.from("products").select("*").order("id", { ascending: false });
    if (error) throw error;

    const products = (data || []).map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      subtitle: p.subtitle || p.short_desc || "",
      category: p.category || "Other",
      price: (p.price || 0) > 15000 ? Math.round((p.price || 0) / 100) : (p.price || 0),
      originalPrice: p.original_price ? ((p.original_price > 20000) ? Math.round(p.original_price / 100) : p.original_price) : Math.round(((p.price || 0) / 100) * 1.25),
      img: p.img || p.image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80",
      description: p.description || p.short_desc || "",
      weight: p.weight || "NA",
      size: p.size || "NA",
      stock: p.stock || 100
    }));

    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/products
router.post("/", requireAdminAuth, async (req, res) => {
  try {
    const { category, customCategory, name, img, price, description, weight, size } = req.body;
    if (!name || !name.trim()) throw new Error("Product name is required");
    if (!price || Number(price) <= 0) throw new Error("Valid product price is required");

    const finalCategory = category === "Other" ? (customCategory?.trim() || "Other") : category;
    const priceVal = Number(price);
    const slug = generateSlug(name) + "-" + Date.now().toString().slice(-4);

    const productData = {
      name: name.trim(),
      slug,
      subtitle: "Vedic Energized & Authentic",
      category: finalCategory,
      purpose: "Sacred Harmony",
      price: priceVal,
      original_price: Math.round(priceVal * 1.25),
      rating: 5.0,
      reviews: 1,
      img: img ? img.trim() : "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80",
      badges: ["Authentic", "Energized"],
      short_desc: description ? description.trim().slice(0, 120) : "Vedic energized product.",
      description: description ? description.trim() : "Sacred authentic product from Aroham.",
      weight: weight || "NA",
      size: size || "NA",
      stock: 100
    };

    const { data, error } = await supabase.from("products").insert(productData).select().single();
    if (error) throw error;
    res.json({ success: true, product: data, message: "Product created successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/admin/products/:id
router.delete("/:id", requireSuperAdmin, async (req, res) => {
  try {
    const parsedId = !isNaN(Number(req.params.id)) ? Number(req.params.id) : req.params.id;
    const { error } = await supabase.from("products").delete().eq("id", parsedId);
    if (error) throw error;
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
