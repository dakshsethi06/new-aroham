// services/onboardingService.js — candidate wizard state manager
const supabase = require("../config/supabase");
const { transition } = require("./applicationStateMachine");
const { sendNotification } = require("./notificationService");

async function getOrCreateApplication(userId) {
  const { data: existing, error } = await supabase
    .from("astrologer_applications")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (existing) return existing;

  // Generate unique application number
  const { data: appNumData, error: seqErr } = await supabase.rpc("next_astrologer_application_number");
  const finalAppNum = appNumData || `AST-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  const { data: created, error: createErr } = await supabase
    .from("astrologer_applications")
    .insert({
      user_id: userId,
      status: "DRAFT",
      current_step: 1,
      application_number: finalAppNum,
    })
    .select()
    .single();

  if (createErr) throw new Error(createErr.message);
  return created;
}

async function getApplicationByUser(userId) {
  const { data, error } = await supabase
    .from("astrologer_applications")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

async function saveStep(applicationId, stepNum, updateData) {
  const step = parseInt(stepNum, 10);
  const update = { current_step: step, updated_at: new Date().toISOString() };

  if (step === 2) {
    update.full_name = updateData.full_name;
    update.display_name = updateData.display_name;
    update.gender = updateData.gender;
    update.dob = updateData.dob;
    update.email = updateData.email;
    update.profile_picture_url = updateData.profile_picture_url;
  } else if (step === 3) {
    update.years_experience = updateData.years_experience;
    update.primary_expertise = updateData.primary_expertise;
    update.secondary_skills = updateData.secondary_skills;
    update.languages = updateData.languages;
    update.availability = updateData.availability;
    update.daily_available_hours = updateData.daily_available_hours;
    update.on_other_platform = updateData.on_other_platform;
    update.other_platform_name = updateData.other_platform_name;
  } else if (step === 4) {
    update.learned_from = updateData.learned_from;
    update.background_description = updateData.background_description;
  } else if (step === 5) {
    update.aadhaar_number = updateData.aadhaar_number;
    update.pan_number = updateData.pan_number;
    update.bank_account_holder_name = updateData.bank_account_holder_name;
    update.bank_account_number = updateData.bank_account_number;
    update.bank_ifsc = updateData.bank_ifsc;
    update.gst_number = updateData.gst_number;
    // Map flat address fields from frontend into JSONB column
    update.address = updateData.address || {
      line: updateData.address_line || "",
      city: updateData.city || "",
      state: updateData.state || "",
      pincode: updateData.pincode || ""
    };
    // Map flat emergency contact fields from frontend into JSONB column
    update.emergency_contact = updateData.emergency_contact || {
      name: updateData.emergency_contact_name || "",
      relation: updateData.emergency_contact_relation || "",
      phone: updateData.emergency_contact_phone || ""
    };
  } else if (step === 6) {
    update.intro_video_url = updateData.intro_video_url;
    update.intro_audio_url = updateData.intro_audio_url;
  } else if (step === 7) {
    update.bio = updateData.bio;
    update.achievements = updateData.achievements;
    update.specializations = updateData.specializations;
    update.awards = updateData.awards;
    update.social_website = updateData.social_website;
    update.social_instagram = updateData.social_instagram;
    update.social_youtube = updateData.social_youtube;
  } else if (step === 8) {
    // Frontend sends agreement_terms, backend column is agreement_terms_accepted
    update.agreement_terms_accepted = updateData.agreement_terms_accepted ?? updateData.agreement_terms ?? false;
    update.agreement_privacy_accepted = updateData.agreement_privacy_accepted ?? updateData.agreement_privacy ?? false;
    update.agreement_platform_accepted = updateData.agreement_platform_accepted ?? updateData.agreement_platform ?? false;
    update.agreement_commission_accepted = updateData.agreement_commission_accepted ?? updateData.agreement_commission ?? false;
    update.digital_signature_name = updateData.digital_signature_name;
    update.agreement_accepted_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("astrologer_applications")
    .update(update)
    .eq("id", applicationId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

async function submitApplication(applicationId) {
  const { data: existing, error } = await supabase
    .from("astrologer_applications")
    .select("status, user_id")
    .eq("id", applicationId)
    .single();

  if (error || !existing) throw new Error("Application not found");

  // State machine transition DRAFT -> SUBMITTED
  const updated = await transition(applicationId, existing.status, "SUBMITTED");

  // Send onboarding notifications
  await sendNotification({
    applicationId,
    userId: existing.user_id,
    title: "Application Submitted Successfully",
    message: "Thank you for applying. Our hiring committee is reviewing your background.",
    channel: "IN_APP",
  });

  return updated;
}

async function getStatusHistory(applicationId) {
  const { data, error } = await supabase
    .from("astrologer_application_status_history")
    .select("*")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

module.exports = {
  getOrCreateApplication,
  getApplicationByUser,
  saveStep,
  submitApplication,
  getStatusHistory,
};
