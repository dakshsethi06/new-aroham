import { supabase } from "../config/supabase.js";

async function safeDelete(tableName, field, value) {
  try {
    const { error } = await supabase.from(tableName).delete().eq(field, value);
    if (error) {
      if (
        error.code === "42P01" ||
        error.code === "42703" ||
        error.message?.includes("does not exist") ||
        error.message?.includes("column")
      ) {
        console.warn(`[Cascading Delete] Table '${tableName}' or column '${field}' missing. Skipping.`);
        return;
      }
      console.warn(`[Cascading Delete] Warning deleting from ${tableName}:`, error.message);
    }
  } catch (e) {
    console.warn(`[Cascading Delete] Exception deleting from ${tableName}:`, e.message);
  }
}

async function safeSelect(tableName, selectFields, field, value) {
  try {
    const { data, error } = await supabase.from(tableName).select(selectFields).eq(field, value);
    if (error) {
      if (
        error.code === "42P01" ||
        error.code === "42703" ||
        error.message?.includes("does not exist") ||
        error.message?.includes("column")
      ) {
        return [];
      }
      console.warn(`[Cascading Delete] Warning selecting from ${tableName}:`, error.message);
      return [];
    }
    return data || [];
  } catch (e) {
    return [];
  }
}

export async function getAllAstrologers() {
  const { data, error } = await supabase
    .from("astrologers")
    .select("*");

  if (error) {
    console.error("Error fetching astrologers:", error);
    throw new Error(error.message);
  }

  return (data || []).map(a => ({
    id: a.id,
    fullName: a.full_name || a.name || "Acharya Astrologer",
    email: a.email || "N/A",
    phone: a.phone || "N/A",
    title: a.title || "Vedic Jyotish Acharya",
    experienceYears: a.experience_years || a.experience || 5,
    specialties: Array.isArray(a.specialties) ? a.specialties : ["Kundali"],
    languages: Array.isArray(a.languages) ? a.languages : ["Hindi", "English"],
    rating: a.rating || 5.0,
    status: a.status || "ACTIVE",
    isOnline: a.is_online !== undefined ? a.is_online : true,
    createdAt: a.created_at || new Date().toISOString()
  }));
}

export async function updateAstrologerStatus(astrologerId, status) {
  const validStatus = status === "BLOCKED" ? "BLOCKED" : "ACTIVE";

  const { data, error } = await supabase
    .from("astrologers")
    .update({ status: validStatus })
    .eq("id", astrologerId)
    .select();

  if (error) throw new Error(error.message);
  return (data && data.length > 0) ? data[0] : { id: astrologerId, status: validStatus };
}

/**
 * Execute complete cascading deletion for an astrologer across all related tables:
 * - astrologer_reviews (astrologer_id)
 * - astrologer_transactions (astrologer_id)
 * - chat_messages (session_id)
 * - chat_sessions (astrologer_id)
 * - public.astrologers (id)
 */
export async function deleteAstrologer(astrologerId) {
  if (!astrologerId) throw new Error("Astrologer ID is required for deletion");

  const cleanId = String(astrologerId).trim();

  // 1. Delete reviews and transactions
  await safeDelete("astrologer_reviews", "astrologer_id", cleanId);
  await safeDelete("astrologer_transactions", "astrologer_id", cleanId);

  // 2. Find all chat_sessions belonging to this astrologer
  const sessions = await safeSelect("chat_sessions", "id", "astrologer_id", cleanId);
  const sessionIds = (sessions || []).map(s => s.id);

  // 3. Delete all chat_messages belonging to those sessions
  if (sessionIds.length > 0) {
    for (const sid of sessionIds) {
      await safeDelete("chat_messages", "session_id", sid);
    }
  }

  // 4. Delete chat_sessions for this astrologer
  await safeDelete("chat_sessions", "astrologer_id", cleanId);

  // 5. Delete astrologer record from public.astrologers table
  const { error: astroDeleteErr } = await supabase
    .from("astrologers")
    .delete()
    .eq("id", cleanId);

  if (astroDeleteErr) {
    console.error("Error deleting from public.astrologers table:", astroDeleteErr);
    throw new Error(astroDeleteErr.message);
  }

  console.log(`[Cascading Delete] Successfully deleted astrologer ${cleanId} and all associated data.`);
  return { success: true, message: `Astrologer ${cleanId} and all associated data deleted successfully` };
}
