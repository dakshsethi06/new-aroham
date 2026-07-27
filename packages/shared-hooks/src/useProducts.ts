import { useState, useEffect } from "react";
import { api } from "@aroham/shared-api";
import { supabase } from "@aroham/shared-services";
import { ArohamProduct } from "@aroham/shared-types/product";
import { DEFAULT_PRODUCTS } from "@aroham/shared-config/products";
import { safeSessionStorage } from "@aroham/shared-utils/storage";

function formatImageUrl(url: any) {
  if (!url || typeof url !== "string") return url;
  const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
  }
  return url;
}

function sanitizeProduct(p: any): ArohamProduct {
  let rawPrice = Number(p.price) || 0;
  while (rawPrice > 15000) {
    rawPrice = rawPrice / 100;
  }
  const priceVal = Math.round(rawPrice);

  let rawOrig = p.original ? Number(p.original) : (p.original_price ? Number(p.original_price) : 0);
  while (rawOrig > 20000) {
    rawOrig = rawOrig / 100;
  }
  const origVal = rawOrig > 0 ? Math.round(rawOrig) : Math.round(priceVal * 1.25);

  const sub = (p.subtitle && p.subtitle !== "undefined") 
    ? p.subtitle 
    : (p.short_desc || p.shortDesc || "Vedic Energized");

  const rawImg = p.img || p.image;
  let finalImg = "https://cdn.shopify.com/s/files/1/0878/4907/4985/files/1_23.jpg?v=1782120393";
  if (rawImg && typeof rawImg === "string" && rawImg.trim() !== "" && rawImg !== "undefined" && !rawImg.includes("photo-1611312449408") && !rawImg.includes("washi-custom-22412387") && !rawImg.includes("figma.site")) {
    finalImg = formatImageUrl(rawImg);
  } else {
    const n = (p.name || "").toLowerCase();
    if (n.includes("karungali") || n.includes("murugan") || n.includes("mala")) finalImg = "https://cdn.shopify.com/s/files/1/0878/4907/4985/files/Gemini_Generated_Image_v3lcuev3lcuev3lc_1.webp?v=1779692958";
    else if (n.includes("tortoise") || n.includes("dhan labh")) finalImg = "https://cdn.shopify.com/s/files/1/0878/4907/4985/files/Artboard1_9.webp?v=1779101616";
    else if (n.includes("khatu") || n.includes("murti") || n.includes("dome")) finalImg = "https://cdn.shopify.com/s/files/1/0878/4907/4985/files/1-2026-05-18T155529.062.webp?v=1779099953";
    else if (n.includes("sun") || n.includes("wall") || n.includes("brass") || n.includes("pyrite")) finalImg = "https://cdn.shopify.com/s/files/1/0878/4907/4985/files/Artboard1_18.webp?v=1782199970";
    else if (n.includes("bracelet") || n.includes("agate") || n.includes("necklace") || n.includes("couple")) finalImg = "https://cdn.shopify.com/s/files/1/0878/4907/4985/files/1-1_f53e2d9e-40a0-4f0e-95a9-8d6a878b2f77.webp?v=1781163169";
    else if (n.includes("ring") || n.includes("citrine")) finalImg = "https://cdn.shopify.com/s/files/1/0878/4907/4985/files/Artboard1_19.webp?v=1782733204";
    else if (n.includes("rudraksha") || n.includes("mukhi")) finalImg = "https://cdn.shopify.com/s/files/1/0878/4907/4985/files/1_a144e37f-680e-430f-80bd-e7c35b9d2ebb.webp?v=1759924225";
  }

  let reviewCount = Number(p.reviews);
  if (!reviewCount || reviewCount <= 5) {
    let hash = 0;
    const str = String(p.id) + (p.name || "");
    for (let i = 0; i < str.length; i++) hash = ((hash << 5) - hash) + str.charCodeAt(i);
    reviewCount = 140 + (Math.abs(hash) % 350);
  }

  return {
    ...p,
    id: p.id,
    slug: p.slug || `product-${p.id}`,
    name: p.name || "Sacred Item",
    subtitle: sub,
    category: p.category || "Other",
    purpose: p.purpose || "Sacred Harmony",
    price: priceVal,
    original: origVal,
    rating: Number(p.rating) >= 4.0 ? Number(p.rating) : 4.8,
    reviews: reviewCount,
    img: finalImg,
    badges: p.badges || ["Temple Energized"],
    shortDesc: p.short_desc || p.shortDesc || p.description || "",
    benefits: p.benefits || ["Temple Energized", "Authentic Vedic Product"],
    size: p.size || "NA",
    material: p.material || "NA",
    useFor: p.use_for || p.useFor || ["Pooja Ghar", "Daily Wear"],
    stock: p.stock || 100
  };
}

const CACHE_KEY = "aroham_products_v5";

export function useProducts() {
  const [products, setProducts] = useState<ArohamProduct[]>(() => {
    const cached = safeSessionStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(sanitizeProduct);
        }
      } catch (e) {}
    }
    return DEFAULT_PRODUCTS.map(sanitizeProduct);
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      // 1. Try fetching from backend API
      try {
        const data = await api("/products");
        if (Array.isArray(data) && data.length > 0) {
          const sanitized = data.map(sanitizeProduct);
          setProducts(sanitized);
          safeSessionStorage.setItem(CACHE_KEY, JSON.stringify(sanitized));
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn("API products endpoint unavailable, querying Supabase directly...", err);
      }

      // 2. Direct Supabase query as robust fallback (works live on Vercel deployment)
      try {
        const { data: supaData, error } = await supabase
          .from("products")
          .select("*")
          .order("id", { ascending: false });

        if (!error && Array.isArray(supaData) && supaData.length > 0) {
          const sanitized = supaData.map(sanitizeProduct);
          setProducts(sanitized);
          safeSessionStorage.setItem(CACHE_KEY, JSON.stringify(sanitized));
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error("Direct Supabase product query error:", e);
      }

      // 3. Fallback to default items if database is unreachable
      const sanitizedDefaults = DEFAULT_PRODUCTS.map(sanitizeProduct);
      setProducts(sanitizedDefaults);
      safeSessionStorage.setItem(CACHE_KEY, JSON.stringify(sanitizedDefaults));
      setLoading(false);
    }

    loadProducts();
  }, []);

  return { products, loading };
}
