import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Video,
  FileText,
  Calendar,
  Sparkles,
  Upload,
  RefreshCw,
  Bell,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  LogOut,
  ExternalLink
} from "lucide-react";
import { AstrologerOnboardingPage } from "./AstrologerOnboardingPage";
import { API_BASE_URL } from "../config/apiConfig";

export function AstrologerOnboardingPortal() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  // Re-upload state
  const [uploadingDocType, setUploadingDocType] = useState<string | null>(null);
  const [docFileUrl, setDocFileUrl] = useState("");

  // Edit fields
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  const token = localStorage.getItem("astro_applicant_token") || localStorage.getItem("aroham_auth_token");

  const fetchStatus = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/onboarding/application`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setData(data);
        setEditForm(data.application || {});
      } else {
        setError(data.error || "Failed to fetch status");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleUpdateField = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/onboarding/application/step/2`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        setIsEditing(false);
        fetchStatus();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDocUpload = async (docType: string) => {
    if (!docFileUrl.trim()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/onboarding/application/documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ documentType: docType, filePath: docFileUrl.trim() })
      });
      if (res.ok) {
        setUploadingDocType(null);
        setDocFileUrl("");
        fetchStatus();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGoToDashboard = () => {
    localStorage.setItem("aroham_astro_onboarded", "true");
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#5B1F24] font-bold">
          <RefreshCw className="w-5 h-5 animate-spin text-[#C8A044]" /> Synchronizing Onboarding Steps...
        </div>
      </div>
    );
  }

  const application = data?.application;
  const status = application?.status || "DRAFT";
  const appNumber = application?.application_number || "AST-2026-XXXXXX";

  if (status === "DRAFT") {
    return <AstrologerOnboardingPage />;
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#3C3024] pt-24 pb-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Portal Header */}
        <div className="bg-white border border-[#5B1F24]/10 rounded-3xl p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 bg-amber-100 border border-[#C8A044]/30 text-[#5B1F24] font-mono text-[10px] rounded-full font-bold">
                {appNumber}
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-250 text-emerald-800 text-[10px] rounded-full font-bold">
                {status.replace(/_/g, " ")}
              </span>
            </div>
            <h1 className="text-xl font-bold text-[#5B1F24] font-serif">Partner Journey: {application?.display_name || application?.full_name}</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                localStorage.removeItem("astro_applicant_token");
                localStorage.removeItem("aroham_mock_session");
                window.location.reload();
              }}
              className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 border border-[#5B1F24]/10 rounded-xl text-[#5B1F24] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>

        {/* Journey Progress Timeline */}
        <div className="bg-white border border-[#5B1F24]/10 rounded-3xl p-6 shadow-md">
          <h3 className="font-bold text-[#5B1F24] text-xs uppercase tracking-wider mb-4 font-serif">Verification Journey Stages</h3>
          <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-semibold">
            {[
              { id: "SUBMITTED", label: "1. Submitted" },
              { id: "INTERVIEW_ROUND_1", label: "2. Round 1" },
              { id: "INTERVIEW_ROUND_2", label: "3. Round 2" },
              { id: "DOCUMENTS_PENDING", label: "4. Verification" },
              { id: "APPROVED", label: "5. Approved!" }
            ].map((step, idx) => {
              const active = status === step.id || (step.id === "DOCUMENTS_PENDING" && status === "NEED_MORE_DOCUMENTS");
              const completed = status !== "DRAFT" && (
                (step.id === "SUBMITTED" && status !== "SUBMITTED") ||
                (step.id === "INTERVIEW_ROUND_1" && status !== "SUBMITTED" && status !== "INTERVIEW_ROUND_1") ||
                (step.id === "INTERVIEW_ROUND_2" && (status === "DOCUMENTS_PENDING" || status === "APPROVED" || status === "ACTIVATED" || status === "NEED_MORE_DOCUMENTS")) ||
                (step.id === "DOCUMENTS_PENDING" && (status === "APPROVED" || status === "ACTIVATED"))
              );
              return (
                <div
                  key={step.id}
                  className={`p-2.5 rounded-xl border transition-all ${
                    active
                      ? "bg-[#5B1F24] border-[#5B1F24] text-white shadow-sm font-bold"
                      : completed
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-amber-50/50 border-amber-900/10 text-amber-900/40"
                  }`}
                >
                  {step.label}
                </div>
              );
            })}
          </div>
        </div>

        {/* SCREEN 1: APPLICATION SUBMITTED */}
        {(status === "SUBMITTED" || status === "PENDING_REVIEW" || status === "UNDER_REVIEW" || status === "SHORTLISTED" || status === "ON_HOLD") && (
          <div className="bg-white border border-[#5B1F24]/10 rounded-3xl p-8 shadow-md space-y-6">
            <div className="text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-[#C8A044] mx-auto animate-pulse" />
              <h2 className="text-xl font-bold text-[#5B1F24] font-serif">Application Submitted Successfully</h2>
              <p className="text-amber-900/70 text-xs max-w-md mx-auto">
                Thank you for applying. Our credentials committee is reviewing your details. Once shortlisted, your Round 1 interview details will show here.
              </p>
            </div>

            {/* Edit Application (Before Review starts) */}
            <div className="pt-6 border-t border-amber-900/10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-[#5B1F24] text-xs uppercase tracking-wider">Application Summary</h3>
                {(status === "SUBMITTED" || status === "PENDING_REVIEW") && (
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-3.5 py-1.5 bg-[#C8A044] hover:bg-[#b08b39] text-white font-bold rounded-lg text-xs shadow-sm cursor-pointer"
                  >
                    {isEditing ? "Cancel" : "Edit Application"}
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleUpdateField} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-amber-900/80 font-bold mb-1">Display Name</label>
                      <input
                        type="text"
                        value={editForm.display_name}
                        onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                        className="w-full bg-amber-50/50 border border-amber-900/20 p-2.5 rounded-xl text-[#3C3024] font-semibold outline-none focus:border-[#5B1F24]"
                      />
                    </div>
                    <div>
                      <label className="block text-amber-900/80 font-bold mb-1">Email Address</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full bg-amber-50/50 border border-amber-900/20 p-2.5 rounded-xl text-[#3C3024] font-semibold outline-none focus:border-[#5B1F24]"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-white font-bold shadow-sm"
                    style={{ background: "linear-gradient(135deg, #5B1F24, #7A2A30)" }}
                  >
                    Save Changes
                  </button>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#3C3024]/90 bg-amber-50/30 p-4 rounded-2xl border border-amber-900/10 font-medium">
                  <p><strong>Full Name:</strong> {application.full_name}</p>
                  <p><strong>Display Name:</strong> {application.display_name}</p>
                  <p><strong>Email:</strong> {application.email}</p>
                  <p><strong>Experience:</strong> {application.years_experience} Years</p>
                  <p><strong>Primary Skills:</strong> {application.primary_expertise?.join(", ")}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SCREEN 2: ROUND 1 INTERVIEW */}
        {status === "INTERVIEW_ROUND_1" && (
          <div className="bg-white border border-[#5B1F24]/10 rounded-3xl p-8 shadow-md space-y-6">
            <div className="text-center space-y-2">
              <Calendar className="w-12 h-12 text-[#C8A044] mx-auto" />
              <h2 className="text-xl font-bold text-[#5B1F24] font-serif">Round 1 — Telephonic Evaluation</h2>
              <p className="text-amber-900/70 text-xs max-w-md mx-auto">
                An evaluator will call you on your registered phone number for a telephonic round. Please keep your credentials handy.
              </p>
            </div>

            <div className="p-4 bg-amber-50/30 border border-amber-900/10 rounded-2xl space-y-2 text-xs font-semibold text-[#3C3024]">
              <p><strong>Interviewer:</strong> Senior Evaluator</p>
              <p><strong>Schedule:</strong> Next Available Business Slot</p>
              <p><strong>Status:</strong> Scheduled / Pending Call</p>
            </div>
          </div>
        )}

        {/* SCREEN 3: ROUND 2 INTERVIEW */}
        {status === "INTERVIEW_ROUND_2" && (
          <div className="bg-white border border-[#5B1F24]/10 rounded-3xl p-8 shadow-md space-y-6">
            <div className="text-center space-y-2">
              <Video className="w-12 h-12 text-[#C8A044] mx-auto" />
              <h2 className="text-xl font-bold text-[#5B1F24] font-serif">Round 2 — Practical Assessment (Video)</h2>
              <p className="text-amber-900/70 text-xs max-w-md mx-auto">
                Join our video meet assessment for Kundali reading, client communication, and consultation styling checks.
              </p>
            </div>

            <div className="p-4 bg-amber-50/30 border border-amber-900/10 rounded-2xl text-xs space-y-3 text-[#3C3024] font-semibold">
              <p><strong>Schedule:</strong> Video consultation assessment slot</p>
              <p><strong>Meeting link:</strong> <a href="https://meet.google.com" target="_blank" rel="noreferrer" className="text-[#5B1F24] font-bold underline inline-flex items-center gap-1">https://meet.google.com <ExternalLink className="w-3 h-3" /></a></p>
              <a
                href="https://meet.google.com"
                target="_blank"
                rel="noreferrer"
                className="block text-center py-2.5 text-white font-bold rounded-xl text-xs shadow-md"
                style={{ background: "linear-gradient(135deg, #5B1F24, #7A2A30)" }}
              >
                Join Video Interview Round
              </a>
            </div>
          </div>
        )}

        {/* SCREEN 4: VERIFICATION CHECKLIST */}
        {(status === "DOCUMENTS_PENDING" || status === "NEED_MORE_DOCUMENTS") && (
          <div className="bg-white border border-[#5B1F24]/10 rounded-3xl p-8 shadow-md space-y-6">
            <div className="text-center space-y-2">
              <ShieldCheck className="w-12 h-12 text-[#C8A044] mx-auto" />
              <h2 className="text-xl font-bold text-[#5B1F24] font-serif">Verification Checklist & Documents</h2>
              <p className="text-amber-900/70 text-xs max-w-md mx-auto">
                Verify your checklist details and upload/re-upload requested documents.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { label: "Government ID (Aadhaar / PAN)", type: "PAN_CARD" },
                { label: "Bank Details (Account # & Cancelled Cheque)", type: "CANCELLED_CHEQUE" },
                { label: "Address Details", type: "ADDRESS_PROOF" },
                { label: "Profile Photo & Biography", type: "PROFILE_PICTURE" }
              ].map((item) => {
                const doc = data.documents?.find((d: any) => d.document_type === item.type);
                const isApproved = doc?.status === "APPROVED";
                const isRejected = doc?.status === "REJECTED" || doc?.status === "REUPLOAD_REQUESTED";

                return (
                  <div key={item.type} className="p-4 bg-amber-50/20 border border-amber-900/10 rounded-2xl flex items-center justify-between text-xs font-semibold">
                    <div>
                      <p className="font-bold text-[#5B1F24]">{item.label}</p>
                      {doc && <p className="text-[10px] text-amber-900/60 mt-0.5">Status: {doc.status}</p>}
                    </div>

                    <div className="flex items-center gap-2">
                      {isApproved ? (
                        <span className="text-emerald-600 font-bold">✓ Approved</span>
                      ) : isRejected || !doc ? (
                        <button
                          onClick={() => setUploadingDocType(item.type)}
                          className="px-3.5 py-1.5 bg-[#C8A044] hover:bg-[#b08b39] text-white font-bold rounded-lg text-[10px] flex items-center gap-1 shadow-sm cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" /> {doc ? "Re-upload" : "Upload"}
                        </button>
                      ) : (
                        <span className="text-[#C8A044]">Under Review</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {uploadingDocType && (
              <div className="p-4 bg-amber-50/50 border border-[#C8A044]/30 rounded-2xl space-y-3 text-xs">
                <p className="font-bold text-[#5B1F24]">Upload document for {uploadingDocType.replace(/_/g, " ")}</p>
                <input
                  type="text"
                  placeholder="Paste PDF or Image File URL..."
                  value={docFileUrl}
                  onChange={(e) => setDocFileUrl(e.target.value)}
                  className="w-full bg-white border border-amber-900/20 p-2.5 rounded-xl text-[#3C3024] text-xs font-semibold outline-none focus:border-[#5B1F24]"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDocUpload(uploadingDocType)}
                    className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-sm cursor-pointer"
                  >
                    Submit Document
                  </button>
                  <button
                    onClick={() => setUploadingDocType(null)}
                    className="px-4 py-2 bg-amber-50 text-[#5B1F24] border border-[#5B1F24]/10 rounded-xl text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SCREEN 5: FINAL APPROVAL SUCCESS */}
        {(status === "APPROVED" || status === "ACTIVATED") && (
          <div className="bg-white border-2 border-[#C8A044]/30 rounded-3xl p-10 shadow-xl text-center space-y-6">
            <Sparkles className="w-16 h-16 text-[#C8A044] mx-auto animate-bounce" />
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#5B1F24] font-serif">🎉 Verification Complete & Approved!</h2>
              <p className="text-amber-900/70 text-sm max-w-md mx-auto">
                Congratulations! You are now a verified partner on Aroham Astrology Network. Your profile is live and ready.
              </p>
            </div>

            <button
              onClick={handleGoToDashboard}
              className="px-8 py-3.5 text-white font-extrabold rounded-xl text-base shadow-md flex items-center gap-2 mx-auto cursor-pointer"
              style={{ background: "linear-gradient(135deg, #5B1F24, #7A2A30)" }}
            >
              Go To Dashboard <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* JOURNEY NOTIFICATIONS LIST */}
        {data?.notifications?.length > 0 && (
          <div className="bg-white border border-[#5B1F24]/10 rounded-3xl p-6 shadow-md space-y-4">
            <h3 className="font-bold text-[#5B1F24] text-xs uppercase tracking-wider flex items-center gap-2 font-serif">
              <Bell className="w-4 h-4 text-[#C8A044]" /> Journey Log Updates
            </h3>
            <div className="space-y-2">
              {data.notifications.map((n: any) => (
                <div key={n.id} className="p-3 bg-amber-50/20 rounded-xl border border-amber-900/10 text-xs flex justify-between items-center font-medium text-[#3C3024]">
                  <div>
                    <span className="font-bold text-[#5B1F24] block">{n.title}</span>
                    <span className="text-amber-900/70">{n.message}</span>
                  </div>
                  <span className="text-[10px] text-amber-900/40">{new Date(n.sent_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
export default AstrologerOnboardingPortal;
