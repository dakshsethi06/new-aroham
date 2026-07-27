import React from "react";
import { Trash2 } from "lucide-react";
import { Product } from "../../types/admin";
import { useAdminAuth } from "../../context/AdminAuthContext";

interface ProductTableProps {
  products: Product[];
  onDelete: (product: Product) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({ products, onDelete }) => {
  const { isSuperAdmin } = useAdminAuth();

  if (!products.length) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-[#5B1F24]/10 my-4">
        <p className="text-sm font-semibold text-[#5B1F24]">No products found in Supabase database.</p>
        <p className="text-xs text-gray-500 mt-1">Upload a new product using the button above.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#5B1F24]/10 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF7F2] text-[#5B1F24] uppercase font-bold border-b border-[#5B1F24]/10">
            <tr>
              <th className="p-3.5">Product</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">Price (₹)</th>
              <th className="p-3.5">Weight</th>
              <th className="p-3.5">Size</th>
              {isSuperAdmin && <th className="p-3.5 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-[#FAF7F2]/50 transition-colors">
                <td className="p-3.5 flex items-center gap-3">
                  <img
                    src={p.img}
                    alt={p.name}
                    className="w-10 h-10 rounded-xl object-cover bg-gray-100 border border-gray-200"
                  />
                  <div>
                    <p className="font-bold text-[#5B1F24] line-clamp-1">{p.name}</p>
                    <p className="text-[10px] text-gray-500 line-clamp-1">{p.description}</p>
                  </div>
                </td>
                <td className="p-3.5">
                  <span className="px-2.5 py-1 rounded-lg bg-[#C8A044]/15 text-[#5B1F24] font-bold text-[11px]">
                    {p.category}
                  </span>
                </td>
                <td className="p-3.5 font-bold text-[#5B1F24] text-sm">
                  ₹{p.price.toLocaleString("en-IN")}
                </td>
                <td className="p-3.5 text-gray-600">{p.weight}</td>
                <td className="p-3.5 text-gray-600">{p.size}</td>
                {isSuperAdmin && (
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => onDelete(p)}
                      className="p-1.5 rounded-lg text-[#d4183d] hover:bg-[#d4183d]/10 transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
