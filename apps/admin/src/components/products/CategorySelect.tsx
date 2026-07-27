import React from "react";

interface CategorySelectProps {
  category: string;
  customCategory: string;
  onCategoryChange: (cat: string) => void;
  onCustomCategoryChange: (cust: string) => void;
}

export const CategorySelect: React.FC<CategorySelectProps> = ({
  category,
  customCategory,
  onCategoryChange,
  onCustomCategoryChange
}) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs font-bold text-[#5B1F24] mb-1">Category</label>
        <select
          value={category}
          onChange={e => onCategoryChange(e.target.value)}
          className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs font-semibold focus:border-[#5B1F24] outline-none"
        >
          {["Yantra", "Pendant", "Crystals", "Bracelets", "Rudraksha", "Other"].map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {category === "Other" && (
        <div>
          <label className="block text-xs font-bold text-[#5B1F24] mb-1">Custom Category</label>
          <input
            type="text"
            placeholder="Enter category name"
            value={customCategory}
            onChange={e => onCustomCategoryChange(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs font-medium focus:border-[#5B1F24] outline-none"
            required
          />
        </div>
      )}
    </div>
  );
};
