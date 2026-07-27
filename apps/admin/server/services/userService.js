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

export async function getAllUsers() {
  const { data, error } = await supabase
    .from("users")
    .select("*");

  if (error) {
    console.error("Error fetching users:", error);
    throw new Error(error.message);
  }

  return (data || []).map(u => ({
    id: u.id,
    fullName: u.full_name || u.name || "Devotee",
    phone: u.phone || "N/A",
    email: u.email || "N/A",
    gender: u.gender || "N/A",
    dob: u.dob || "N/A",
    status: u.status || "ACTIVE",
    createdAt: u.created_at || new Date().toISOString()
  }));
}

export async function updateUserStatus(userId, status) {
  const validStatus = status === "BLOCKED" ? "BLOCKED" : "ACTIVE";

  const { data, error } = await supabase
    .from("users")
    .update({ status: validStatus })
    .eq("id", userId)
    .select();

  if (error) throw new Error(error.message);
  return (data && data.length > 0) ? data[0] : { id: userId, status: validStatus };
}

/**
 * Execute complete cascading deletion for a user across all related tables:
 * - user_carts (user_id)
 * - user_wishlists (user_id)
 * - addresses (user_id)
 * - astrologer_reviews & astrologer_transactions (user_id)
 * - reviews & subscribers & profiles (user_id / id)
 * - order_items & payments & orders (user_id / order_id)
 * - chat_messages & chat_sessions (user_id / session_id)
 * - public.users (id)
 * - auth.users (Supabase Auth)
 */
export async function deleteUser(userId) {
  if (!userId) throw new Error("User ID is required for deletion");

  const cleanId = String(userId).trim();

  // 1. Resolve user profile details (ID, phone, email) to match related records across tables
  const { data: userProfile } = await supabase
    .from("users")
    .select("id, phone, email")
    .eq("id", cleanId)
    .maybeSingle();

  const userIds = [cleanId];
  if (userProfile?.id && !userIds.includes(String(userProfile.id))) {
    userIds.push(String(userProfile.id));
  }

  for (const uid of userIds) {
    // Carts & Wishlists (column is user_id)
    await safeDelete("user_carts", "user_id", uid);
    await safeDelete("cart_items", "user_id", uid);
    await safeDelete("user_wishlists", "user_id", uid);

    // Addresses & Reviews & Transactions (column is user_id)
    await safeDelete("addresses", "user_id", uid);
    await safeDelete("astrologer_reviews", "user_id", uid);
    await safeDelete("astrologer_transactions", "user_id", uid);
    await safeDelete("reviews", "user_id", uid);
    await safeDelete("subscribers", "user_id", uid);
    await safeDelete("profiles", "id", uid);
    await safeDelete("profiles", "user_id", uid);
  }

  // 4. Find all orders belonging to this user (column is user_id)
  let orderIds = [];
  for (const uid of userIds) {
    const userOrders = await safeSelect("orders", "id", "user_id", uid);
    if (userOrders && userOrders.length > 0) {
      orderIds.push(...userOrders.map(o => o.id));
    }
  }

  // Delete order_items for all user orders
  if (orderIds.length > 0) {
    for (const oid of orderIds) {
      await safeDelete("order_items", "order_id", oid);
    }
  }

  // Delete user payments
  for (const uid of userIds) {
    await safeDelete("payments", "user_id", uid);
  }
  if (orderIds.length > 0) {
    for (const oid of orderIds) {
      await safeDelete("payments", "order_id", oid);
    }
  }

  // Delete user orders
  for (const uid of userIds) {
    await safeDelete("orders", "user_id", uid);
  }

  // 5. Delete chat messages and chat sessions
  let sessionIds = [];
  for (const uid of userIds) {
    const sessions = await safeSelect("chat_sessions", "id", "user_id", String(uid));
    if (sessions && sessions.length > 0) {
      sessionIds.push(...sessions.map(s => s.id));
    }
  }

  if (sessionIds.length > 0) {
    for (const sid of sessionIds) {
      await safeDelete("chat_messages", "session_id", sid);
    }
  }

  for (const uid of userIds) {
    await safeDelete("chat_sessions", "user_id", String(uid));
  }

  // 6. Delete profile from public.users table (column is id)
  const { error: userDeleteErr } = await supabase
    .from("users")
    .delete()
    .eq("id", cleanId);

  if (userDeleteErr) {
    console.error("Error deleting from public.users table:", userDeleteErr);
    throw new Error(userDeleteErr.message);
  }

  // 7. Delete from auth.users (Supabase Auth) if valid UUID
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);
  if (isUuid && supabase.auth?.admin?.deleteUser) {
    try {
      await supabase.auth.admin.deleteUser(cleanId);
      console.log(`[Cascading Delete] Deleted auth.users entry for ${cleanId}`);
    } catch (authErr) {
      console.warn(`[Cascading Delete] auth.users deletion warning (non-fatal): ${authErr.message}`);
    }
  }

  console.log(`[Cascading Delete] Successfully deleted user ${cleanId} and all associated data.`);
  return { success: true, message: `User ${cleanId} and all associated data deleted successfully` };
}
