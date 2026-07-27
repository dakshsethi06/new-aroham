// services/applicationStateMachine.js — the legal status transitions for onboarding
const supabase = require("../config/supabase");

const ALLOWED_TRANSITIONS = {
  DRAFT: ["SUBMITTED"],
  SUBMITTED: ["PENDING_REVIEW"],
  PENDING_REVIEW: ["UNDER_REVIEW", "SHORTLISTED", "REJECTED", "ON_HOLD", "NEED_MORE_DOCUMENTS"],
  UNDER_REVIEW: ["SHORTLISTED", "REJECTED", "ON_HOLD", "NEED_MORE_DOCUMENTS"],
  SHORTLISTED: ["INTERVIEW_ROUND_1", "DOCUMENTS_PENDING", "APPROVED", "REJECTED", "ON_HOLD", "NEED_MORE_DOCUMENTS"],
  INTERVIEW_ROUND_1: ["INTERVIEW_ROUND_2", "REJECTED", "ON_HOLD"],
  INTERVIEW_ROUND_2: ["DOCUMENTS_PENDING", "APPROVED", "REJECTED", "ON_HOLD"],
  DOCUMENTS_PENDING: ["DOCUMENTS_VERIFIED", "NEED_MORE_DOCUMENTS", "REJECTED"],
  DOCUMENTS_VERIFIED: ["APPROVED", "REJECTED"],
  APPROVED: ["ACTIVATED", "ON_HOLD"],
  ACTIVATED: ["SUSPENDED", "DEACTIVATED", "BLOCKED"],
  NEED_MORE_DOCUMENTS: ["UNDER_REVIEW", "DOCUMENTS_PENDING", "REJECTED"],
  ON_HOLD: ["UNDER_REVIEW", "SHORTLISTED", "REJECTED"],
  REJECTED: ["PENDING_REVIEW"], 
  SUSPENDED: ["ACTIVATED", "DEACTIVATED", "BLOCKED"],
  BLOCKED: ["ACTIVATED", "DEACTIVATED"],
  DEACTIVATED: ["ACTIVATED"],
};

function canTransition(from, to) {
  return Array.isArray(ALLOWED_TRANSITIONS[from]) && ALLOWED_TRANSITIONS[from].includes(to);
}

async function transition(applicationId, from, to, { adminId = null, reason = null } = {}) {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid transition: ${from} -> ${to}`);
  }

  const update = { status: to, updated_at: new Date().toISOString() };
  if (to === "SUBMITTED") update.submitted_at = new Date().toISOString();
  if (to === "UNDER_REVIEW") update.reviewed_at = new Date().toISOString();
  if (to === "APPROVED") update.approved_at = new Date().toISOString();
  if (to === "ACTIVATED") update.activated_at = new Date().toISOString();
  if (to === "REJECTED") {
    update.rejected_at = new Date().toISOString();
    if (reason) update.rejection_reason = reason;
  }

  const { data, error } = await supabase
    .from("astrologer_applications")
    .update(update)
    .eq("id", applicationId)
    .select()
    .single();
  if (error) throw new Error(error.message);

  const { error: histErr } = await supabase.from("astrologer_application_status_history").insert({
    application_id: applicationId,
    from_status: from,
    to_status: to,
    changed_by: adminId,
    reason,
  });
  if (histErr) throw new Error(histErr.message);

  return data;
}

module.exports = { ALLOWED_TRANSITIONS, canTransition, transition };
