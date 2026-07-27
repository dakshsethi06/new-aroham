// routes/onboarding.js — candidate wizard & applicant portal routes.
const router = require("express").Router();
const multer = require("multer");
const requireAuth = require("../middleware/auth");
const supabase = require("../config/supabase");
const otpService = require("../services/otpService");
const onboardingService = require("../services/onboardingService");
const documentService = require("../services/documentService");
const { getCandidateNotifications } = require("../services/notificationService");

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/onboarding/mobile/send-otp
router.post("/mobile/send-otp", async (req, res) => {
  try {
    const { countryCode, mobile } = req.body;
    if (!mobile || !/^\d{10}$/.test(mobile.trim())) {
      return res.status(400).json({ error: "Mobile number must be exactly 10 digits" });
    }
    await otpService.sendOtp(countryCode, mobile.trim());
    res.json({ success: true, message: "OTP sent" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/onboarding/mobile/verify-otp
router.post("/mobile/verify-otp", async (req, res) => {
  try {
    const { countryCode, mobile, otp } = req.body;
    if (!mobile || !/^\d{10}$/.test(mobile.trim())) {
      return res.status(400).json({ error: "Mobile number must be exactly 10 digits" });
    }
    const result = otpService.verifyOtp(countryCode, mobile.trim(), otp);
    if (!result.valid) return res.status(400).json({ error: result.reason });

    const cleanMobile = mobile.trim();
    const finalEmail = `${cleanMobile}@aroham-astrologer.in`;
    const password = `AstroApplicant${cleanMobile}!`;

    let userId;
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email: finalEmail,
      password,
      email_confirm: true,
      user_metadata: { phone: cleanMobile, applicant: true },
    });

    if (createErr) {
      if (createErr.message.includes("already registered") || createErr.message.includes("already exists")) {
        const { data: listData } = await supabase.auth.admin.listUsers();
        const existingUser = (listData?.users || []).find((u) => u.email === finalEmail);
        if (!existingUser) throw createErr;
        userId = existingUser.id;
      } else {
        throw createErr;
      }
    } else {
      userId = created.user.id;
    }

    const { data: session, error: signInErr } = await supabase.auth.signInWithPassword({
      email: finalEmail,
      password,
    });
    if (signInErr) throw signInErr;

    const application = await onboardingService.getOrCreateApplication(userId);
    await supabase
      .from("astrologer_applications")
      .update({ country_code: countryCode || "+91", mobile: cleanMobile, mobile_verified_at: new Date().toISOString() })
      .eq("id", application.id);

    res.json({
      success: true,
      accessToken: session.session.access_token,
      refreshToken: session.session.refresh_token,
      applicationId: application.id,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/onboarding/application — fetch-or-create current user's application
router.get("/application", requireAuth, async (req, res) => {
  try {
    const application = await onboardingService.getOrCreateApplication(req.user.id);
    const documents = await documentService.listDocuments(application.id);
    const notifications = await getCandidateNotifications(application.id);
    res.json({ application, documents, notifications });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/onboarding/application/step/:n — partial save
router.patch("/application/step/:n", requireAuth, async (req, res) => {
  try {
    const application = await onboardingService.getApplicationByUser(req.user.id);
    if (!application) return res.status(404).json({ error: "Application not found" });

    // Lock editing if status is beyond DRAFT / SUBMITTED (i.e. review has started)
    if (application.status !== "DRAFT" && application.status !== "SUBMITTED") {
      return res.status(403).json({ error: "Application is under review and cannot be edited." });
    }

    const updated = await onboardingService.saveStep(application.id, req.params.n, req.body);
    res.json({ success: true, application: updated });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// POST /api/onboarding/application/documents — upload document
router.post("/application/documents", requireAuth, upload.single("file"), async (req, res) => {
  try {
    const application = await onboardingService.getApplicationByUser(req.user.id);
    if (!application) return res.status(404).json({ error: "Application not found" });

    let doc;
    if (req.file) {
      doc = await documentService.uploadDocument(application.id, req.body.documentType, req.file);
    } else if (req.body.filePath) {
      // Direct mock upload by URL path
      const { data, error } = await supabase
        .from("astrologer_documents")
        .upsert({
          application_id: application.id,
          document_type: req.body.documentType,
          file_path: req.body.filePath,
          file_name: `${req.body.documentType.toLowerCase()}.pdf`,
          mime_type: "application/pdf",
          status: "PENDING",
          uploaded_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      doc = data;
    }

    res.json({ success: true, document: doc });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// POST /api/onboarding/application/submit
router.post("/application/submit", requireAuth, async (req, res) => {
  try {
    const application = await onboardingService.getApplicationByUser(req.user.id);
    if (!application) return res.status(404).json({ error: "Application not found" });

    const result = await onboardingService.submitApplication(application.id);
    res.json({ success: true, application: result });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
