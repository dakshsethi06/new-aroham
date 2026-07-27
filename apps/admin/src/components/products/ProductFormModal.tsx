import React, { useState, useRef } from "react";
import { X, Plus, Sparkles, Upload, Image as ImageIcon, Link as LinkIcon, CheckCircle2 } from "lucide-react";
import { CategorySelect } from "./CategorySelect";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => Promise<void>;
  isLoading: boolean;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading
}) => {
  const [category, setCategory] = useState("Yantra");
  const [customCategory, setCustomCategory] = useState("");
  const [name, setName] = useState("");
  const [img, setImg] = useState("");
  const [imageFileName, setImageFileName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [weight, setWeight] = useState("");
  const [size, setSize] = useState("");
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (PNG, JPG, WEBP, etc.)");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert("File size exceeds 8MB. Please choose a smaller image.");
      return;
    }

    setImageFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImg(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setImg("");
    setImageFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      category, customCategory, name, img, price: Number(price),
      description, weight: weight.trim() || "NA", size: size.trim() || "NA"
    });
    setName(""); setImg(""); setImageFileName(""); setPrice(""); setDescription(""); setWeight(""); setSize(""); setCustomCategory("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#5B1F24]/10 space-y-4 my-8">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2 text-[#5B1F24]">
            <Sparkles size={18} className="text-[#C8A044]" />
            <h3 className="text-base font-bold">Upload New Sacred Product</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <CategorySelect
            category={category}
            customCategory={customCategory}
            onCategoryChange={setCategory}
            onCustomCategoryChange={setCustomCategory}
          />

          <div>
            <label className="block text-xs font-bold text-[#5B1F24] mb-1">Product Name</label>
            <input type="text" placeholder="e.g. 5 Mukhi Nepal Rudraksha" value={name} onChange={e => setName(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs font-medium outline-none" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#5B1F24] mb-1">Price (₹ INR)</label>
              <input type="number" placeholder="499" value={price} onChange={e => setPrice(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs font-medium outline-none" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#5B1F24] mb-1">Weight (NA if empty)</label>
              <input type="text" placeholder="e.g. 25g or NA" value={weight} onChange={e => setWeight(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs font-medium outline-none" />
            </div>
          </div>

          {/* Image Upload Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#5B1F24]">Product Image</label>
              <div className="flex rounded-lg bg-gray-100 p-0.5 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setUploadMode("file")}
                  className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${uploadMode === "file" ? "bg-white text-[#5B1F24] shadow-2xs font-bold" : "text-gray-600"}`}
                >
                  <Upload size={11} /> File Upload
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode("url")}
                  className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${uploadMode === "url" ? "bg-white text-[#5B1F24] shadow-2xs font-bold" : "text-gray-600"}`}
                >
                  <LinkIcon size={11} /> Image URL
                </button>
              </div>
            </div>

            {uploadMode === "file" ? (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {img ? (
                  <div className="relative flex items-center gap-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50/50">
                    <img src={img} alt="Product Preview" className="w-14 h-14 object-cover rounded-lg border border-emerald-200 shrink-0 bg-white" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 text-xs font-bold text-emerald-800">
                        <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                        <span className="truncate">{imageFileName || "Image selected"}</span>
                      </div>
                      <p className="text-[10px] text-emerald-700/80 font-medium">Ready to upload to database</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearImage}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-white transition-colors"
                      title="Remove Image"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#5B1F24]/40 bg-[#FAF7F2]/50 hover:bg-[#FAF7F2] cursor-pointer transition-all text-center space-y-1.5 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#5B1F24]/5 text-[#5B1F24] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#5B1F24]">Click to upload product image</p>
                      <p className="text-[10px] text-gray-500 font-medium">PNG, JPG, WEBP or GIF (up to 8MB)</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <input
                  type="url"
                  placeholder="Paste direct image link (e.g. https://...)"
                  value={img}
                  onChange={e => { setImg(e.target.value); setImageFileName(""); }}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs font-medium outline-none"
                />
                {img && (
                  <div className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-200">
                    <img src={img} alt="Preview" className="w-10 h-10 object-cover rounded-md bg-white border" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    <span className="text-[11px] font-semibold text-gray-700 truncate">{img}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#5B1F24] mb-1">Size (NA if empty)</label>
              <input type="text" placeholder="e.g. 15mm or NA" value={size} onChange={e => setSize(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs font-medium outline-none" />
            </div>
            <div className="flex flex-col justify-end">
              <span className="text-[10px] text-gray-500 font-semibold mb-1">Weight & Size display in catalog</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5B1F24] mb-1">Details & Description</label>
            <textarea rows={3} placeholder="Describe sacred properties and usage..." value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 text-xs font-medium outline-none" />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#5B1F24] hover:bg-[#7A2A30] shadow-md flex items-center gap-1.5 disabled:opacity-50">
              <Plus size={14} />
              <span>{isLoading ? "Publishing..." : "Upload & Sync to Aroham"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
