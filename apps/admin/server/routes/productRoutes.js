import express from "express";
import { getAllProducts, createProduct, deleteProduct } from "../services/productService.js";
import { requireAdminAuth, requireSuperAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

// GET /api/admin/products
router.get("/", requireAdminAuth, async (req, res) => {
  try {
    const products = await getAllProducts();
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/products
router.post("/", requireAdminAuth, async (req, res) => {
  try {
    const product = await createProduct(req.body);
    res.json({ success: true, product, message: "Product created and published to Aroham website successfully!" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/admin/products/:id
router.delete("/:id", requireSuperAdmin, async (req, res) => {
  try {
    await deleteProduct(req.params.id);
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
