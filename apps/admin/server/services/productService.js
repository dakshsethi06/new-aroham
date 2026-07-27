import { supabase } from "../config/supabase.js";

function generateSlug(name) {
  return name.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}

function formatImageUrl(url) {
  if (!url || typeof url !== "string") return url;
  const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
  }
  return url;
}

export async function getAllProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("id", { ascending: false });

  if (error) throw new Error(error.message);
  return data.map(p => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    subtitle: p.subtitle || p.short_desc || "",
    category: p.category || "Other",
    price: (p.price || 0) / 100, // convert paise to ₹
    originalPrice: p.original_price ? p.original_price / 100 : ((p.price || 0) / 100) * 1.25,
    img: formatImageUrl(p.img || p.image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80"),
    description: p.description || p.short_desc || "",
    weight: p.weight || "NA",
    size: p.size || "NA",
    stock: p.stock || 100
  }));
}

export async function createProduct(payload) {
  const { category, customCategory, name, img, price, description, weight, size } = payload;
  
  if (!name || !name.trim()) throw new Error("Product name is required");
  if (!price || Number(price) <= 0) throw new Error("Valid product price is required");

  const finalCategory = category === "Other" ? (customCategory?.trim() || "Other") : category;
  const priceInPaise = Math.round(Number(price) * 100);
  const originalPriceInPaise = Math.round(priceInPaise * 1.25);
  const finalWeight = (weight && weight.trim()) ? weight.trim() : "NA";
  const finalSize = (size && size.trim()) ? size.trim() : "NA";
  const rawImg = (img && img.trim()) ? img.trim() : "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80";
  const finalImg = formatImageUrl(rawImg);

  const slug = generateSlug(name) + "-" + Date.now().toString().slice(-4);

  const productData = {
    name: name.trim(),
    slug,
    subtitle: "Vedic Energized & Authentic",
    category: finalCategory,
    purpose: "Sacred Harmony",
    price: priceInPaise,
    original_price: originalPriceInPaise,
    rating: 5.0,
    reviews: 1,
    img: finalImg,
    badges: ["Authentic", "Energized"],
    short_desc: description ? description.trim().slice(0, 120) : "Vedic energized product.",
    description: description ? description.trim() : "Sacred authentic product from Aroham.",
    weight: finalWeight,
    size: finalSize,
    stock: 100
  };

  const { data, error } = await supabase
    .from("products")
    .insert(productData)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteProduct(productId) {
  const parsedId = !isNaN(Number(productId)) ? Number(productId) : productId;
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", parsedId);

  if (error) throw new Error(error.message);
  return { success: true };
}
