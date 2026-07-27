import dotenv from "dotenv";
dotenv.config();
import { supabase } from "../server/config/supabase.js";

function formatImageUrl(url) {
  if (!url || typeof url !== "string") return url;
  const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
  }
  return url;
}

async function fixImages() {
  const { data: products } = await supabase.from("products").select("id, name, img");
  for (const p of products) {
    if (p.img && p.img.includes("drive.google.com")) {
      const fixedImg = formatImageUrl(p.img);
      console.log(`Updating product ${p.id} (${p.name}): ${p.img} -> ${fixedImg}`);
      const { error } = await supabase.from("products").update({ img: fixedImg }).eq("id", p.id);
      if (error) console.error("Error updating product:", error);
    }
  }
  console.log("Image fix complete!");
}

fixImages();
