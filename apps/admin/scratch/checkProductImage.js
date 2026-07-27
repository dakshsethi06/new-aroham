import dotenv from "dotenv";
dotenv.config();
import { supabase } from "../server/config/supabase.js";

async function checkProducts() {
  const { data, error } = await supabase.from("products").select("id, name, img, category").order("id", { ascending: false });
  if (error) {
    console.error("Error fetching products:", error);
    return;
  }
  console.log("Recent products in DB:", JSON.stringify(data.slice(0, 5), null, 2));
}

checkProducts();
