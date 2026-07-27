import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Upload,
  ShieldCheck,
  Award,
  Video,
  FileText,
  UserCheck,
  Sparkles,
  Phone,
  Lock,
  Building2,
  AlertCircle
} from "lucide-react";
import { API_BASE_URL } from "../config/apiConfig";

const EXPERTISE_OPTIONS = [
  "Vedic Astrology",
  "Tarot Reading",
  "Numerology",
  "Palmistry",
  "Lal Kitab",
  "KP Astrology",
  "Vastu Shastra",
  "Reiki Healing",
  "Face Reading",
  "Psychic Reading"
];

const LANGUAGE_OPTIONS = [
  "Hindi",
  "English",
  "Sanskrit",
  "Tamil",
  "Telugu",
  "Bengali",
  "Marathi",
  "Gujarati",
  "Kannada",
  "Malayalam",
  "Punjabi"
];

const INPUT_CLASS =
  "bg-amber-50/50 border border-amber-900/20 rounded-xl px-4 py-3 text-[#3C3024] text-xs font-semibold focus:border-[#5B1F24] outline-none transition-colors";

export function AstrologerOnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileVerified, setMobileVerified] = useState(false);

  const [token, setToken] = useState<string | null>(() => localStorage.getItem("astro_applicant_token"));
  const [applicationId, setApplicationId] = useState<string | null>(() => localStorage.getItem("astro_application_id"));

  // Step 1
  const [countryCode, setCountryCode] = useState("+91");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // Form state steps 2-8
  const [formData, setFormData] = useState({
    full_name: "",
    display_name: "",
    gender: "Male",
    dob: "",
    email: "",
    profile_picture_url: "",

    years_experience: 5,
    primary_expertise: [] as string[],
    secondary_skills: [] as string[],
    languages: [] as string[],
    availability: [] as string[],
    daily_available_hours: 4,
    on_other_platform: false,
    other_platform_name: "",

    learned_from: "FAMILY_TRADITION",
    background_description: "",

    aadhaar_number: "",
    pan_number: "",
    bank_account_holder_name: "",
    bank_account_number: "",
    bank_ifsc: "",
    gst_number: "",
    address_line: "",
    city: "",
    state: "",
    pincode: "",
    emergency_contact_name: "",
    emergency_contact_relation: "",
    emergency_contact_phone: "",

    intro_video_url: "",
    intro_audio_url: "",

    bio: "",
    achievements: "",
    specializations: [] as string[],
    awards: "",
    social_website: "",
    social_instagram: "",
    social_youtube: "",

    agreement_terms: false,
    agreement_privacy: false,
    agreement_platform: false,
    agreement_commission: false,
    digital_signature_name: ""
  });

  const handleSendOtp = async () => {
    if (!mobile || !/^\d{10}$/.test(mobile.trim())) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/onboarding/mobile/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryCode, mobile: mobile.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setOtpSent(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      setError("Please enter OTP code");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/onboarding/mobile/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryCode, mobile: mobile.trim(), otp: otp.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "OTP verification failed");
      
      setToken(data.accessToken);
      setApplicationId(data.applicationId);
      localStorage.setItem("astro_applicant_token", data.accessToken);
      localStorage.setItem("astro_application_id", data.applicationId);
      setMobileVerified(true);
      setCurrentStep(2);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const saveStep = async (stepNum: number) => {
    if (!token) return;
    try {
      await fetch(`${API_BASE_URL}/api/onboarding/application/step/${stepNum}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
    } catch (e) {
      console.warn("Autosave step failed:", e);
    }
  };

  const handleNext = async () => {
    setError(null);

    // Block moving past Step 1 without verified OTP
    if (currentStep === 1 && !mobileVerified) {
      setError("Please verify your mobile number before proceeding.");
      return;
    }

    // Basic validation per step
    if (currentStep === 2) {
      if (!formData.full_name.trim()) { setError("Full Name is required."); return; }
      if (!formData.email.trim()) { setError("Email is required."); return; }
    }

    await saveStep(currentStep);
    if (currentStep < 8) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      // Don't let user go back to step 1 once verified
      if (currentStep === 2 && mobileVerified) return;
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmitApplication = async () => {
    if (!formData.agreement_terms || !formData.agreement_privacy || !formData.agreement_platform || !formData.agreement_commission) {
      setError("You must accept all terms and agreements to submit.");
      return;
    }
    if (!formData.digital_signature_name.trim()) {
      setError("Please provide your digital signature name.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await saveStep(8);
      const res = await fetch(`${API_BASE_URL}/api/onboarding/application/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      
      navigate("/astrologer/portal");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleArrayItem = (field: keyof typeof formData, item: string) => {
    setFormData((prev) => {
      const arr = (prev[field] as string[]) || [];
      const exists = arr.includes(item);
      return {
        ...prev,
        [field]: exists ? arr.filter((x) => x !== item) : [...arr, item]
      };
    });
  };

  const STEPS = [
    { num: 1, label: "Mobile" },
    { num: 2, label: "Basic Info" },
    { num: 3, label: "Expertise" },
    { num: 4, label: "Lineage" },
    { num: 5, label: "Identity" },
    { num: 6, label: "Intro Video" },
    { num: 7, label: "Bio & Links" },
    { num: 8, label: "Submit" }
  ];

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#3C3024] pt-24 pb-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-[#C8A044]/30 text-[#5B1F24] text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-4 h-4 text-[#C8A044]" /> Partner Onboarding Wizard
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#5B1F24] font-serif">Join Aroham Astrology Network</h1>
          <p className="mt-2 text-amber-900/70 text-xs">Provide your lineage, credentials, and verification details to partner with us</p>
        </div>

        {/* Stepper tracker */}
        <div className="mb-8 bg-white border border-[#5B1F24]/10 rounded-2xl p-4 shadow-md">
          <div className="flex justify-between items-center overflow-x-auto pb-2 scrollbar-none gap-2">
            {STEPS.map((step) => {
              const active = currentStep === step.num;
              const completed = currentStep > step.num;
              return (
                <div key={step.num} className="flex items-center gap-2 min-w-max">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      completed
                        ? "bg-[#C8A044] text-white"
                        : active
                        ? "bg-[#5B1F24] text-white ring-4 ring-[#5B1F24]/15"
                        : "bg-amber-50/80 text-amber-900/60 border border-amber-900/20"
                    }`}
                  >
                    {completed ? <CheckCircle2 className="w-4 h-4" /> : step.num}
                  </div>
                  <span className={`text-xs font-semibold ${active ? "text-[#5B1F24] font-bold" : completed ? "text-[#C8A044] font-bold" : "text-amber-900/60"}`}>
                    {step.label}
                  </span>
                  {step.num < 8 && <div className={`w-6 h-[2px] ${completed ? "bg-[#C8A044]" : "bg-amber-900/10"}`} />}
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white border-2 border-[#5B1F24]/10 rounded-3xl p-6 sm:p-10 shadow-xl">
          
          {/* ────────────────────── STEP 1: MOBILE OTP ────────────────────── */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[#5B1F24] flex items-center gap-2 font-serif">
                <Phone className="w-5 h-5 text-[#C8A044]" /> Step 1: Mobile Verification
              </h2>
              <p className="text-xs text-amber-900/70 -mt-3">We will send you a one-time verification code to your mobile number.</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-amber-900/70 mb-1.5 uppercase tracking-wider">Country Code</label>
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className={INPUT_CLASS + " w-full"}
                  >
                    <option value="+91">🇮🇳 India (+91)</option>
                    <option value="+1">🇺🇸 USA (+1)</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[10px] font-bold text-amber-900/70 uppercase tracking-wider">Mobile Number</label>
                    {otpSent && !mobileVerified && (
                      <button
                        type="button"
                        onClick={() => { setOtpSent(false); setOtp(""); setError(null); }}
                        className="text-[11px] font-bold text-[#5B1F24] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        ✏️ Change Number
                      </button>
                    )}
                  </div>
                  <input
                    type="tel"
                    placeholder="Enter your 10-digit mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    disabled={otpSent && mobileVerified}
                    className={INPUT_CLASS + " w-full"}
                  />
                </div>
              </div>

              {!otpSent ? (
                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl text-xs font-bold text-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #5B1F24, #7A2A30)" }}
                >
                  {loading ? "Sending..." : "Send OTP Verification Code"}
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-amber-900/70 mb-1.5 uppercase tracking-wider">Enter OTP Code</label>
                    <input
                      type="text"
                      placeholder="Enter 4-digit OTP (Test: 1234)"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full bg-amber-50/50 border border-amber-900/20 rounded-xl px-4 py-3 text-[#5B1F24] text-center font-mono tracking-widest text-lg outline-none focus:border-[#5B1F24]"
                    />
                  </div>
                  <button
                    onClick={handleVerifyOtp}
                    disabled={loading}
                    className="w-full py-3 bg-[#C8A044] hover:bg-[#b08b39] text-white font-bold rounded-xl text-xs shadow-md disabled:opacity-50"
                  >
                    {loading ? "Verifying..." : "Verify Code"}
                  </button>
                </div>
              )}

              {mobileVerified && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Mobile number verified successfully!
                </div>
              )}
            </div>
          )}

          {/* ────────────────────── STEP 2: PERSONAL PROFILE ────────────────────── */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[#5B1F24] flex items-center gap-2 font-serif">
                <UserCheck className="w-5 h-5 text-[#C8A044]" /> Step 2: Personal Profile
              </h2>
              <p className="text-xs text-amber-900/70 -mt-3">Tell us about yourself. This information will be used for your public astrologer profile.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-amber-900/70 mb-1.5 uppercase tracking-wider">Full Name *</label>
                  <input
                    type="text"
                    placeholder="Your legal full name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className={INPUT_CLASS + " w-full"}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-amber-900/70 mb-1.5 uppercase tracking-wider">Display Name</label>
                  <input
                    type="text"
                    placeholder="Name shown on your public profile"
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    className={INPUT_CLASS + " w-full"}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-amber-900/70 mb-1.5 uppercase tracking-wider">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className={INPUT_CLASS + " w-full"}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-amber-900/70 mb-1.5 uppercase tracking-wider">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className={INPUT_CLASS + " w-full"}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-amber-900/70 mb-1.5 uppercase tracking-wider">Email Address *</label>
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={INPUT_CLASS + " w-full"}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-amber-900/70 mb-1.5 uppercase tracking-wider">Profile Photo URL</label>
                  <input
                    type="text"
                    placeholder="Link to your profile photo"
                    value={formData.profile_picture_url}
                    onChange={(e) => setFormData({ ...formData, profile_picture_url: e.target.value })}
                    className={INPUT_CLASS + " w-full"}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────── STEP 3: EXPERTISE ────────────────────── */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[#5B1F24] flex items-center gap-2 font-serif">
                <Award className="w-5 h-5 text-[#C8A044]" /> Step 3: Professional Credentials
              </h2>
              <p className="text-xs text-amber-900/70 -mt-3">Describe your skills, expertise areas, and availability for consultations.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-amber-900/70 mb-1.5 uppercase tracking-wider">Years of Experience</label>
                  <input
                    type="number"
                    placeholder="Years of experience"
                    value={formData.years_experience}
                    onChange={(e) => setFormData({ ...formData, years_experience: parseInt(e.target.value) || 0 })}
                    className={INPUT_CLASS + " w-full"}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-amber-900/70 mb-1.5 uppercase tracking-wider">Daily Available Hours</label>
                  <input
                    type="number"
                    placeholder="Hours per day"
                    value={formData.daily_available_hours}
                    onChange={(e) => setFormData({ ...formData, daily_available_hours: parseFloat(e.target.value) || 0 })}
                    className={INPUT_CLASS + " w-full"}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-amber-900/70 mb-2 uppercase tracking-wider">Primary Expertise (select all that apply)</label>
                <div className="flex flex-wrap gap-2">
                  {EXPERTISE_OPTIONS.map((skill) => {
                    const selected = formData.primary_expertise.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleArrayItem("primary_expertise", skill)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          selected
                            ? "bg-[#5B1F24] text-white shadow-md"
                            : "bg-amber-50/50 text-[#3C3024] border border-amber-900/10 hover:bg-amber-100/50"
                        }`}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-amber-900/70 mb-2 uppercase tracking-wider">Languages Spoken</label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGE_OPTIONS.map((lang) => {
                    const selected = formData.languages.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleArrayItem("languages", lang)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          selected
                            ? "bg-[#5B1F24] text-white shadow-md"
                            : "bg-amber-50/50 text-[#3C3024] border border-amber-900/10 hover:bg-amber-100/50"
                        }`}
                      >
                        {lang}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────── STEP 4: LINEAGE & TRADITION ────────────────────── */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[#5B1F24] flex items-center gap-2 font-serif">
                <Sparkles className="w-5 h-5 text-[#C8A044]" /> Step 4: Study Lineage & Tradition
              </h2>
              <p className="text-xs text-amber-900/70 -mt-3">Tell us about where you learned your astrology skills and your guru lineage.</p>

              <div>
                <label className="block text-[10px] font-bold text-amber-900/70 mb-1.5 uppercase tracking-wider">How Did You Learn Astrology?</label>
                <select
                  value={formData.learned_from}
                  onChange={(e) => setFormData({ ...formData, learned_from: e.target.value })}
                  className={INPUT_CLASS + " w-full"}
                >
                  <option value="FAMILY_TRADITION">Family Tradition</option>
                  <option value="GURU">Guru</option>
                  <option value="INSTITUTE">Institute</option>
                  <option value="UNIVERSITY">University</option>
                  <option value="CERTIFICATION">Certification</option>
                  <option value="SELF_LEARNING">Self Learning</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-amber-900/70 mb-1.5 uppercase tracking-wider">Background Description</label>
                <textarea
                  rows={4}
                  placeholder="Briefly describe your astrology study background or guru lineage..."
                  value={formData.background_description}
                  onChange={(e) => setFormData({ ...formData, background_description: e.target.value })}
                  className={INPUT_CLASS + " w-full"}
                />
              </div>
            </div>
          )}

          {/* ────────────────────── STEP 5: VERIFICATION & PAYOUT ────────────────────── */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[#5B1F24] flex items-center gap-2 font-serif">
                <Lock className="w-5 h-5 text-[#C8A044]" /> Step 5: Verification & Payout Details
              </h2>
              <p className="text-xs text-amber-900/70 -mt-3">Your identity documents and bank details for consultation payouts. All data is encrypted and secured.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-amber-900/70 mb-1.5 uppercase tracking-wider">Aadhaar Number</label>
                  <input
                    type="text"
                    placeholder="12-digit Aadhaar number"
                    value={formData.aadhaar_number}
                    onChange={(e) => setFormData({ ...formData, aadhaar_number: e.target.value })}
                    className={INPUT_CLASS + " w-full"}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-amber-900/70 mb-1.5 uppercase tracking-wider">PAN Number</label>
                  <input
                    type="text"
                    placeholder="e.g. ABCDE1234F"
                    value={formData.pan_number}
                    onChange={(e) => setFormData({ ...formData, pan_number: e.target.value })}
                    className={INPUT_CLASS + " w-full"}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-amber-900/70 mb-1.5 uppercase tracking-wider">Bank A/C Holder Name</label>
                  <input
                    type="text"
                    placeholder="Name as per bank records"
                    value={formData.bank_account_holder_name}
                    onChange={(e) => setFormData({ ...formData, bank_account_holder_name: e.target.value })}
                    className={INPUT_CLASS + " w-full"}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-amber-900/70 mb-1.5 uppercase tracking-wider">Bank Account Number</label>
                  <input
                    type="text"
                    placeholder="Your bank account number"
                    value={formData.bank_account_number}
                    onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                    className={INPUT_CLASS + " w-full"}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-amber-900/70 mb-1.5 uppercase tracking-wider">Bank IFSC Code</label>
                  <input
                    type="text"
                    placeholder="e.g. SBIN0001234"
                    value={formData.bank_ifsc}
                    onChange={(e) => setFormData({ ...formData, bank_ifsc: e.target.value })}
                    className={INPUT_CLASS + " w-full"}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-amber-900/70 mb-1.5 uppercase tracking-wider">GST Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="GST number if applicable"
                    value={formData.gst_number}
                    onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
                    className={INPUT_CLASS + " w-full"}
                  />
                </div>
              </div>

              {/* Address section */}
              <div>
                <label className="block text-[10px] font-bold text-amber-900/70 mb-2 uppercase tracking-wider">Address Details</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Address Line"
                      value={formData.address_line}
                      onChange={(e) => setFormData({ ...formData, address_line: e.target.value })}
                      className={INPUT_CLASS + " w-full"}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className={INPUT_CLASS}
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className={INPUT_CLASS}
                  />
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <label className="block text-[10px] font-bold text-amber-900/70 mb-2 uppercase tracking-wider">Emergency Contact</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Contact Name"
                    value={formData.emergency_contact_name}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                    className={INPUT_CLASS}
                  />
                  <input
                    type="text"
                    placeholder="Relation (e.g. Spouse)"
                    value={formData.emergency_contact_relation}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_relation: e.target.value })}
                    className={INPUT_CLASS}
                  />
                  <input
                    type="tel"
                    placeholder="Contact Phone"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────── STEP 6: INTRO VIDEO ────────────────────── */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[#5B1F24] flex items-center gap-2 font-serif">
                <Video className="w-5 h-5 text-[#C8A044]" /> Step 6: Audio & Video Introduction
              </h2>
              <p className="text-xs text-amber-900/70 -mt-3">Record a short introduction video (2-3 minutes) and upload the link. This helps seekers choose you.</p>

              <div>
                <label className="block text-[10px] font-bold text-amber-900/70 mb-1.5 uppercase tracking-wider">Video Intro Link</label>
                <input
                  type="text"
                  placeholder="GDrive, Loom, or YouTube link"
                  value={formData.intro_video_url}
                  onChange={(e) => setFormData({ ...formData, intro_video_url: e.target.value })}
                  className={INPUT_CLASS + " w-full"}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-amber-900/70 mb-1.5 uppercase tracking-wider">Audio Intro Link (Optional)</label>
                <input
                  type="text"
                  placeholder="Audio introduction link (optional)"
                  value={formData.intro_audio_url}
                  onChange={(e) => setFormData({ ...formData, intro_audio_url: e.target.value })}
                  className={INPUT_CLASS + " w-full"}
                />
              </div>
            </div>
          )}

          {/* ────────────────────── STEP 7: BIO & SOCIAL ────────────────────── */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[#5B1F24] flex items-center gap-2 font-serif">
                <FileText className="w-5 h-5 text-[#C8A044]" /> Step 7: Biography & Social Portals
              </h2>
              <p className="text-xs text-amber-900/70 -mt-3">Write a compelling public biography and link your social media profiles.</p>

              <div>
                <label className="block text-[10px] font-bold text-amber-900/70 mb-1.5 uppercase tracking-wider">
                  Public Bio ({formData.bio.length}/1000 characters)
                </label>
                <textarea
                  rows={4}
                  maxLength={1000}
                  placeholder="Write a public biography that seekers will see on your profile..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className={INPUT_CLASS + " w-full"}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-amber-900/70 mb-1.5 uppercase tracking-wider">Achievements & Awards</label>
                <input
                  type="text"
                  placeholder="Notable achievements or awards"
                  value={formData.achievements}
                  onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                  className={INPUT_CLASS + " w-full"}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-amber-900/70 mb-1.5 uppercase tracking-wider">Website URL</label>
                  <input
                    type="text"
                    placeholder="https://yourwebsite.com"
                    value={formData.social_website}
                    onChange={(e) => setFormData({ ...formData, social_website: e.target.value })}
                    className={INPUT_CLASS + " w-full"}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-amber-900/70 mb-1.5 uppercase tracking-wider">Instagram Link</label>
                  <input
                    type="text"
                    placeholder="https://instagram.com/yourhandle"
                    value={formData.social_instagram}
                    onChange={(e) => setFormData({ ...formData, social_instagram: e.target.value })}
                    className={INPUT_CLASS + " w-full"}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-amber-900/70 mb-1.5 uppercase tracking-wider">YouTube Channel</label>
                  <input
                    type="text"
                    placeholder="https://youtube.com/yourchannel"
                    value={formData.social_youtube}
                    onChange={(e) => setFormData({ ...formData, social_youtube: e.target.value })}
                    className={INPUT_CLASS + " w-full"}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────── STEP 8: AGREEMENT & SUBMIT ────────────────────── */}
          {currentStep === 8 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[#5B1F24] flex items-center gap-2 font-serif">
                <Building2 className="w-5 h-5 text-[#C8A044]" /> Step 8: Platform Terms & Sign Off
              </h2>
              <p className="text-xs text-amber-900/70 -mt-3">Review and accept the platform agreements to submit your application.</p>

              <div className="space-y-3 bg-amber-50/50 p-5 rounded-xl border border-amber-900/10 text-xs text-amber-950/80 font-medium">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreement_terms}
                    onChange={(e) => setFormData({ ...formData, agreement_terms: e.target.checked })}
                    className="w-4 h-4 rounded text-[#5B1F24] bg-white border-amber-900/20 focus:ring-0 focus:ring-offset-0 mt-0.5 shrink-0"
                  />
                  <span>I agree to the <strong className="text-[#5B1F24]">Terms of Service</strong> and understand the platform usage guidelines.</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreement_privacy}
                    onChange={(e) => setFormData({ ...formData, agreement_privacy: e.target.checked })}
                    className="w-4 h-4 rounded text-[#5B1F24] bg-white border-amber-900/20 focus:ring-0 focus:ring-offset-0 mt-0.5 shrink-0"
                  />
                  <span>I agree to the <strong className="text-[#5B1F24]">Privacy Policy</strong> and consent to data processing.</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreement_platform}
                    onChange={(e) => setFormData({ ...formData, agreement_platform: e.target.checked })}
                    className="w-4 h-4 rounded text-[#5B1F24] bg-white border-amber-900/20 focus:ring-0 focus:ring-offset-0 mt-0.5 shrink-0"
                  />
                  <span>I agree to the <strong className="text-[#5B1F24]">Platform Code of Conduct</strong> and ethical consultation standards.</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreement_commission}
                    onChange={(e) => setFormData({ ...formData, agreement_commission: e.target.checked })}
                    className="w-4 h-4 rounded text-[#5B1F24] bg-white border-amber-900/20 focus:ring-0 focus:ring-offset-0 mt-0.5 shrink-0"
                  />
                  <span>I accept the <strong className="text-[#5B1F24]">Platform Commission Policy</strong> (platform retains a % of consultation earnings).</span>
                </label>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-amber-900/70 mb-1.5 uppercase tracking-wider">Digital Signature</label>
                <input
                  type="text"
                  placeholder="Type your full legal name as digital signature"
                  value={formData.digital_signature_name}
                  onChange={(e) => setFormData({ ...formData, digital_signature_name: e.target.value })}
                  className={INPUT_CLASS + " w-full"}
                />
              </div>
            </div>
          )}

          {/* ────────────────────── NAVIGATION BUTTONS ────────────────────── */}
          <div className="flex justify-between items-center pt-8 border-t border-amber-950/10 mt-8">
            {currentStep > 1 && currentStep > 2 ? (
              <button
                onClick={handleBack}
                className="px-5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#5B1F24] text-xs font-bold border border-[#5B1F24]/10 flex items-center gap-1 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < 8 ? (
              <button
                onClick={handleNext}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md active:scale-95 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #5B1F24, #7A2A30)" }}
              >
                Next Step <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitApplication}
                disabled={loading}
                className="px-7 py-3 rounded-xl text-xs font-bold text-white shadow-md active:scale-95 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #C8A044, #b08b39)" }}
              >
                {loading ? "Submitting..." : "Submit Application"} <ShieldCheck className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
export default AstrologerOnboardingPage;
