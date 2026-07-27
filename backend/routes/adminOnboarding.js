// routes/adminOnboarding.js — Admin-facing hiring dashboard, document verification, interview scoring, and activation APIs.
const router = require("express").Router();
const supabase = require("../config/supabase");
const { transition, ALLOWED_TRANSITIONS } = require("../services/applicationStateMachine");
const { scheduleInterview, recordInterviewEvaluation, listInterviewsForApplication } = require("../services/interviewService");
const { sendNotification, getCandidateNotifications } = require("../services/notificationService");

// GET /api/admin/onboarding/applications — List & filter applications
router.get("/applications", async (req, res) => {
  try {
    const { status, search, experience, language, skill, page = 1, limit = 50 } = req.query;

    let query = supabase.from("astrologer_applications").select("*", { count: "exact" });

    if (status && status !== "ALL") {
      query = query.eq("status", status);
    }

    if (search) {
      const q = `%${search.trim()}%`;
      query = query.or(`full_name.ilike.${q},display_name.ilike.${q},email.ilike.${q},mobile.ilike.${q},application_number.ilike.${q}`);
    }

    if (experience) {
      const minExp = parseInt(experience, 10);
      if (!isNaN(minExp)) query = query.gte("years_experience", minExp);
    }

    if (language) {
      query = query.contains("languages", [language]);
    }

    if (skill) {
      query = query.contains("primary_expertise", [skill]);
    }

    const from = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const to = from + parseInt(limit, 10) - 1;

    const { data: applications, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw new Error(error.message);

    res.json({ success: true, applications: applications || [], total: count || 0 });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/admin/onboarding/applications/:id — Full Dossier Details
router.get("/applications/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data: application, error: appErr } = await supabase
      .from("astrologer_applications")
      .select("*")
      .eq("id", id)
      .single();

    if (appErr || !application) return res.status(404).json({ error: "Application not found" });

    const { data: documents } = await supabase
      .from("astrologer_documents")
      .select("*")
      .eq("application_id", id);

    const interviews = await listInterviewsForApplication(id);

    const { data: notes } = await supabase
      .from("astrologer_admin_notes")
      .select("*")
      .eq("application_id", id)
      .order("created_at", { ascending: false });

    const { data: history } = await supabase
      .from("astrologer_application_status_history")
      .select("*")
      .eq("application_id", id)
      .order("created_at", { ascending: false });

    const notifications = await getCandidateNotifications(id);

    res.json({
      success: true,
      application,
      documents: documents || [],
      interviews: interviews || [],
      notes: notes || [],
      history: history || [],
      notifications: notifications || [],
      allowedTransitions: ALLOWED_TRANSITIONS[application.status] || [],
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/admin/onboarding/applications/:id/status — Admin Status Transition
router.patch("/applications/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { toStatus, reason, adminId } = req.body;

    const { data: application } = await supabase
      .from("astrologer_applications")
      .select("status, user_id")
      .eq("id", id)
      .single();

    if (!application) return res.status(404).json({ error: "Application not found" });

    const updated = await transition(id, application.status, toStatus, { adminId, reason });

    await sendNotification({
      applicationId: id,
      userId: application.user_id,
      title: `Application status updated to ${toStatus.replace(/_/g, " ")}`,
      message: `Your application status changed to ${toStatus.replace(/_/g, " ")}.${reason ? ` Reason: ${reason}` : ""}`,
      channel: "IN_APP",
    });

    res.json({ success: true, application: updated });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// POST /api/admin/onboarding/applications/:id/documents/:docId/review — Review Document
router.post("/applications/:id/documents/:docId/review", async (req, res) => {
  try {
    const { docId } = req.params;
    const { status, rejectionReason, adminId } = req.body;

    const { data: updatedDoc, error } = await supabase
      .from("astrologer_documents")
      .update({
        status,
        rejection_reason: rejectionReason || null,
        reviewed_by: adminId || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", docId)
      .select()
      .single();

    if (error) throw new Error(error.message);

    res.json({ success: true, document: updatedDoc });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// POST /api/admin/onboarding/applications/:id/interviews — Schedule Interview Round
router.post("/applications/:id/interviews", async (req, res) => {
  try {
    const { id } = req.params;
    const round = await scheduleInterview({
      applicationId: id,
      ...req.body,
    });
    res.json({ success: true, interview: round });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// PATCH /api/admin/onboarding/applications/:id/interviews/:interviewId — Evaluation Scores
router.patch("/applications/:id/interviews/:interviewId", async (req, res) => {
  try {
    const { interviewId } = req.params;
    const round = await recordInterviewEvaluation(interviewId, req.body);
    res.json({ success: true, interview: round });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// POST /api/admin/onboarding/applications/:id/notes — Add Internal Note
router.post("/applications/:id/notes", async (req, res) => {
  try {
    const { id } = req.params;
    const { note, adminId } = req.body;

    if (!note || !note.trim()) return res.status(400).json({ error: "Note text is required" });

    const { data, error } = await supabase
      .from("astrologer_admin_notes")
      .insert({
        application_id: id,
        admin_id: adminId || null,
        note: note.trim(),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    res.json({ success: true, note: data });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// POST /api/admin/onboarding/applications/:id/activate — GO LIVE & Create Wallet
router.post("/applications/:id/activate", async (req, res) => {
  try {
    const { id } = req.params;
    const { pricePerMin = 25, commissionPct = 20, isFeatured = false } = req.body;

    const { data: app, error: appErr } = await supabase
      .from("astrologer_applications")
      .select("*")
      .eq("id", id)
      .single();

    if (appErr || !app) return res.status(404).json({ error: "Application not found" });

    const cleanName = (app.display_name || app.full_name || "astrologer").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const slug = `${cleanName}-${Math.floor(1000 + Math.random() * 9000)}`;
    const astroId = `astro_${Date.now()}`;

    // Create public astrologer profile
    const { data: astro, error: astroErr } = await supabase
      .from("astrologers")
      .upsert({
        id: astroId,
        name: app.display_name || app.full_name,
        slug,
        image_url: app.profile_picture_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
        rating: 5.0,
        experience_years: app.years_experience || 5,
        price_per_min: Number(pricePerMin),
        skills: app.primary_expertise || ["Vedic Astrology"],
        languages: app.languages || ["Hindi", "English"],
        bio: app.bio || "Professional astrologer",
        status: "ACTIVE",
        is_online: true,
        is_busy: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (astroErr) throw new Error(`Astrologer creation error: ${astroErr.message}`);

    // Create wallet
    await supabase.from("astrologer_wallets").upsert({
      astrologer_id: astroId,
      balance: 0.0,
      currency: "INR",
    });

    // Create initial performance metrics
    await supabase.from("astrologer_performance_metrics").upsert({
      astrologer_id: astroId,
      average_rating: 5.0,
      acceptance_rate: 100.0,
    });

    // Mark application as ACTIVATED
    await supabase
      .from("astrologer_applications")
      .update({
        status: "ACTIVATED",
        activated_at: new Date().toISOString(),
        astrologer_id: astroId,
      })
      .eq("id", id);

    await sendNotification({
      applicationId: id,
      userId: app.user_id,
      title: "🎉 Profile Activated & LIVE!",
      message: "Congratulations! Your profile is now live. Welcome aboard!",
      channel: "WHATSAPP",
    });

    res.json({ success: true, message: "Profile activated!", astrologer: astro });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// GET /api/admin/onboarding/performance — Performance List
router.get("/performance", async (req, res) => {
  try {
    const { data: metrics, error } = await supabase
      .from("astrologer_performance_metrics")
      .select("*, astrologers(name, image_url, price_per_min, status)");

    if (error) throw new Error(error.message);
    res.json({ success: true, performance: metrics || [] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
