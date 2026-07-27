// services/interviewService.js — Round 1 & Round 2 interview feedback scoring & results
const supabase = require("../config/supabase");
const { transition } = require("./applicationStateMachine");
const { sendNotification } = require("./notificationService");

async function scheduleInterview({ applicationId, roundNumber, roundType, scheduledDate, scheduledTime, meetingLink, interviewerName, adminId }) {
  const { data: existingApp, error: appErr } = await supabase
    .from("astrologer_applications")
    .select("status, user_id")
    .eq("id", applicationId)
    .single();

  if (appErr || !existingApp) throw new Error("Application not found");

  const { data: round, error } = await supabase
    .from("astrologer_interview_rounds")
    .insert({
      application_id: applicationId,
      round_number: roundNumber,
      round_type: roundType || (roundNumber === 1 ? "PHONE" : "VIDEO_MEET"),
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime,
      meeting_link: meetingLink || null,
      interviewer_name: interviewerName || "Aroham Evaluator",
      interviewer_id: adminId || null,
      status: "PENDING",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  const targetStatus = roundNumber === 1 ? "INTERVIEW_ROUND_1" : "INTERVIEW_ROUND_2";
  if (existingApp.status !== targetStatus) {
    try {
      await transition(applicationId, existingApp.status, targetStatus, { adminId, reason: `Interview Round ${roundNumber} scheduled` });
    } catch (e) {
      console.log(`[interviewService] Status transition deferred: ${e.message}`);
    }
  }

  await sendNotification({
    applicationId,
    userId: existingApp.user_id,
    title: `Interview Round ${roundNumber} Scheduled`,
    message: `Your Round ${roundNumber} interview is scheduled on ${scheduledDate} at ${scheduledTime}.${meetingLink ? ` Link: ${meetingLink}` : ""}`,
    channel: "EMAIL",
  });

  return round;
}

async function recordInterviewEvaluation(interviewId, { scoreCommunication, scoreKnowledge, scoreConfidence, scorePracticalReading, scoreClientHandling, result, remarks, adminId }) {
  const comm = Number(scoreCommunication) || 0;
  const know = Number(scoreKnowledge) || 0;
  const conf = Number(scoreConfidence) || 0;
  const prac = Number(scorePracticalReading) || 0;
  const hand = Number(scoreClientHandling) || 0;
  
  const overallScore = Number(((comm + know + conf + prac + hand) / 5).toFixed(2));

  const { data: updatedRound, error } = await supabase
    .from("astrologer_interview_rounds")
    .update({
      score_communication: comm,
      score_knowledge: know,
      score_confidence: conf,
      score_practical_reading: prac,
      score_client_handling: hand,
      overall_score: overallScore,
      result: result || "HOLD",
      remarks: remarks || "",
      status: "COMPLETED",
      completed_at: new Date().toISOString(),
    })
    .eq("id", interviewId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  const { data: app } = await supabase
    .from("astrologer_applications")
    .select("status, user_id")
    .eq("id", updatedRound.application_id)
    .single();

  if (app && result === "PASS") {
    const nextStatus = updatedRound.round_number === 1 ? "INTERVIEW_ROUND_2" : "DOCUMENTS_PEND";
    // We map DOCUMENTS_PENDING to DOCUMENTS_PENDING status.
    const finalNextStatus = updatedRound.round_number === 1 ? "INTERVIEW_ROUND_2" : "DOCUMENTS_PENDING";
    try {
      await transition(updatedRound.application_id, app.status, finalNextStatus, { adminId, reason: `Passed Round ${updatedRound.round_number} interview` });
    } catch (e) {
      console.log(`[interviewService] Status transition deferred: ${e.message}`);
    }

    await sendNotification({
      applicationId: updatedRound.application_id,
      userId: app.user_id,
      title: `Interview Round ${updatedRound.round_number} Passed!`,
      message: `Congratulations! You passed Round ${updatedRound.round_number} of your evaluation.`,
      channel: "IN_APP",
    });
  } else if (app && result === "FAIL") {
    try {
      await transition(updatedRound.application_id, app.status, "REJECTED", { adminId, reason: `Did not clear Interview Round ${updatedRound.round_number}` });
    } catch (e) {
      console.log(`[interviewService] Status transition deferred: ${e.message}`);
    }
  }

  return updatedRound;
}

async function listInterviewsForApplication(applicationId) {
  const { data, error } = await supabase
    .from("astrologer_interview_rounds")
    .select("*")
    .eq("application_id", applicationId)
    .order("round_number", { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

module.exports = {
  scheduleInterview,
  recordInterviewEvaluation,
  listInterviewsForApplication,
};
