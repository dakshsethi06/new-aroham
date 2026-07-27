// services/notificationService.js — candidate notification logger
const supabase = require("../config/supabase");

async function sendNotification({ applicationId, userId, title, message, channel = "IN_APP" }) {
  try {
    const { data, error } = await supabase
      .from("astrologer_notifications")
      .insert({
        application_id: applicationId || null,
        user_id: userId || null,
        title,
        message,
        channel,
        read: false,
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("[notificationService] Error saving notification:", error.message);
    }
    
    console.log(`[Notification dispatched via ${channel}] To Candidate: ${title} - ${message}`);
    return data;
  } catch (err) {
    console.error("[notificationService] Exception:", err.message);
    return null;
  }
}

async function getCandidateNotifications(applicationId) {
  const { data, error } = await supabase
    .from("astrologer_notifications")
    .select("*")
    .eq("application_id", applicationId)
    .order("sent_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

module.exports = {
  sendNotification,
  getCandidateNotifications,
};
