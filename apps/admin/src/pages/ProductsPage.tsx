import React, { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { Product } from "../types/admin";
import { adminFetch } from "../services/apiClient";
import { ProductTable } from "../components/products/ProductTable";
import { ProductFormModal } from "../components/products/ProductFormModal";
import { ConfirmModal } from "../components/common/ConfirmModal";

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteProductTarget, setDeleteProductTarget] = useState<Product | null>(null);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch("/products");
      if (res.success && res.products) setProducts(res.products);
    } catch (err) { console.error("Failed to fetch products:", err); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadProducts(); }, []);

  useEffect(() => {
    let result = products;
    if (selectedCategory !== "ALL") {
      const catLower = selectedCategory.toLowerCase();
      result = result.filter(p => {
        const pCat = (p.category || "").toLowerCase();
        return pCat === catLower || pCat.includes(catLower) || catLower.includes(pCat);
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    setFilteredProducts(result);
  }, [products, selectedCategory, searchQuery]);

  const handleCreateProduct = async (formData: any) => {
    setIsSubmitting(true);
    try {
      await adminFetch("/products", { method: "POST", body: JSON.stringify(formData) });
      setIsFormOpen(false);
      await loadProducts();
    } catch (err: any) { alert(err.message || "Failed to create product"); }
    finally { setIsSubmitting(false); }
  };

  const handleDeleteProduct = async () => {
    if (!deleteProductTarget) return;
    setIsSubmitting(true);
    try {
      await adminFetch(`/products/${deleteProductTarget.id}`, { method: "DELETE" });
      setDeleteProductTarget(null);
      await loadProducts();
    } catch (err: any) { alert(err.message || "Failed to delete product"); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#5B1F24]" style={{ fontFamily: "Cinzel, serif" }}>Product Management</h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Manage & publish products directly to Aroham website database</p>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="px-4 py-2.5 rounded-xl bg-[#5B1F24] hover:bg-[#7A2A30] text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer">
          <Plus size={16} /><span>Upload New Product</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#5B1F24]/10">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input type="text" placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full h-9 pl-9 pr-3 text-xs bg-[#FAF7F2] rounded-xl border border-gray-200 outline-none" />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {["ALL", "Yantra", "Pendant", "Crystals", "Bracelets", "Rudraksha"].map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${selectedCategory === cat ? "bg-[#5B1F24] text-white font-bold" : "bg-[#FAF7F2] text-gray-700"}`}>{cat}</button>
          ))}
        </div>
      </div>

      {isLoading ? <div className="text-center py-12 text-xs font-semibold text-gray-500">Loading products from Supabase...</div> : (
        <ProductTable products={filteredProducts} onDelete={p => setDeleteProductTarget(p)} />
      )}

      <ProductFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSubmit={handleCreateProduct} isLoading={isSubmitting} />
      <ConfirmModal isOpen={!!deleteProductTarget} title="Delete Product" message={`Are you sure you want to delete "${deleteProductTarget?.name}"?`} confirmText="Delete Product" onConfirm={handleDeleteProduct} onClose={() => setDeleteProductTarget(null)} isLoading={isSubmitting} />
    </div>
  );
};
