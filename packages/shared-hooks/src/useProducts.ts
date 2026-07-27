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
  const finalImg = (rawImg && rawImg !== "undefined") 
    ? formatImageUrl(rawImg) 
    : "https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?auto=format&fit=crop&w=400&q=80";

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
    rating: Number(p.rating) || 5.0,
    reviews: Number(p.reviews) || 1,
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

const CACHE_KEY = "aroham_products_v3";

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
