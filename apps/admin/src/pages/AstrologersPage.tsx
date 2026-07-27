import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Video,
  FileText,
  Calendar,
  Sparkles,
  Eye,
  Plus,
  MessageSquare,
  ShieldCheck,
  Award,
  BookOpen,
  History,
  AlertTriangle,
  UserX,
  PhoneCall,
  ChevronRight,
  ExternalLink,
  Trash2,
  Lock,
  Unlock,
  RefreshCw
} from "lucide-react";
import { adminFetch } from "../services/apiClient";
import { API_BASE_URL } from "../config/apiConfig";

type TabType =
  | "APPLICATIONS"
  | "ROUND_1"
  | "ROUND_2"
  | "VERIFICATION"
  | "APPROVED"
  | "LIVE"
  | "REJECTED"
  | "INACTIVE"
  | "CALENDAR"
  | "LOGS";

export const AstrologersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("APPLICATIONS");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [liveAstrologers, setLiveAstrologers] = useState<any[]>([]);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [scheduledCalendar, setScheduledCalendar] = useState<any[]>([]);

  // Dossier inspector modal
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [dossier, setDossier] = useState<any | null>(null);
  const [dossierTab, setDossierTab] = useState<"INFO" | "DOCS" | "INTERVIEWS" | "NOTES" | "STATUS" | "ACTIVATE">("INFO");
  const [dossierLoading, setDossierLoading] = useState(false);

  // Notes, Rejection, Pricing states
  const [noteText, setNoteText] = useState("");
  const [docRejectionReason, setDocRejectionReason] = useState("");

  const [interviewForm, setInterviewForm] = useState({
    roundNumber: 1,
    roundType: "PHONE",
    scheduledDate: "",
    scheduledTime: "",
    meetingLink: "",
    interviewerName: "Aroham Senior Evaluator"
  });

  const [evalForm, setEvalForm] = useState({
    interviewId: "",
    scoreCommunication: 8,
    scoreKnowledge: 8,
    scoreConfidence: 8,
    scorePracticalReading: 8,
    scoreClientHandling: 8,
    result: "PASS",
    remarks: ""
  });

  const [pricingForm, setPricingForm] = useState({
    pricePerMin: 25,
    commissionPct: 20,
    isFeatured: false
  });

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Load Onboarding applications from backend
      const onboardingRes = await fetch(`${API_BASE_URL}/api/admin/onboarding/applications`);
      const onboardingData = await onboardingRes.json();
      if (onboardingRes.ok) {
        setApplications(onboardingData.applications || []);
      }

      // 2. Load Live Astrologers from existing client
      const liveRes = await adminFetch("/astrologers");
      if (liveRes.success && liveRes.astrologers) {
        setLiveAstrologers(liveRes.astrologers);
      }

      // 3. Compile Interview Calendar (Filter from Applications)
      if (onboardingRes.ok && onboardingData.applications) {
        const apps = onboardingData.applications;
        const calendarList: any[] = [];
        const logsList: any[] = [];

        for (const app of apps) {
          // Fetch detailed sub-dossier to compile calendar & logs
          try {
            const detailRes = await fetch(`${API_BASE_URL}/api/admin/onboarding/applications/${app.id}`);
            const detailData = await detailRes.json();
            if (detailRes.ok) {
              if (detailData.interviews && detailData.interviews.length > 0) {
                detailData.interviews.forEach((iv: any) => {
                  calendarList.push({
                    ...iv,
                    candidateName: app.display_name || app.full_name,
                    appNumber: app.application_number
                  });
                });
              }
              if (detailData.history && detailData.history.length > 0) {
                detailData.history.forEach((hist: any) => {
                  logsList.push({
                    ...hist,
                    candidateName: app.display_name || app.full_name,
                    appNumber: app.application_number
                  });
                });
              }
            }
          } catch (err) {}
        }
        setScheduledCalendar(calendarList.sort((a, b) => a.scheduled_date > b.scheduled_date ? 1 : -1));
        setHistoryLogs(logsList.sort((a, b) => b.created_at > a.created_at ? 1 : -1));
      }

    } catch (err) {
      console.error("Failed to load astrologers/applications data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const openDossier = async (id: string) => {
    setSelectedAppId(id);
    setDossierLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/onboarding/applications/${id}`);
      const data = await res.json();
      if (res.ok) {
        setDossier(data);
        setDossierTab("INFO");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDossierLoading(false);
    }
  };

  const handleStatusChange = async (toStatus: string) => {
    if (!selectedAppId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/onboarding/applications/${selectedAppId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toStatus, reason: "Hiring decision update" })
      });
      if (res.ok) {
        openDossier(selectedAppId);
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReviewDoc = async (docId: string, status: string) => {
    if (!selectedAppId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/onboarding/applications/${selectedAppId}/documents/${docId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, rejectionReason: docRejectionReason })
      });
      if (res.ok) {
        setDocRejectionReason("");
        openDossier(selectedAppId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddNote = async () => {
    if (!selectedAppId || !noteText.trim()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/onboarding/applications/${selectedAppId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: noteText.trim() })
      });
      if (res.ok) {
        setNoteText("");
        openDossier(selectedAppId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleScheduleInterview = async () => {
    if (!selectedAppId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/onboarding/applications/${selectedAppId}/interviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(interviewForm)
      });
      if (res.ok) {
        alert("Interview scheduled successfully!");
        openDossier(selectedAppId);
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRecordEvaluation = async () => {
    if (!selectedAppId || !evalForm.interviewId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/onboarding/applications/${selectedAppId}/interviews/${evalForm.interviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(evalForm)
      });
      if (res.ok) {
        alert("Evaluation score submitted successfully!");
        openDossier(selectedAppId);
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleActivateGoLive = async () => {
    if (!selectedAppId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/onboarding/applications/${selectedAppId}/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pricingForm)
      });
      if (res.ok) {
        alert("🎉 Astrologer has been activated and is now LIVE!");
        openDossier(selectedAppId);
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Directory block/unblock/delete handles
  const handleToggleStatus = async (astrologer: any) => {
    const nextStatus = astrologer.status === "BLOCKED" ? "ACTIVE" : "BLOCKED";
    try {
      await adminFetch(`/astrologers/${astrologer.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus })
      });
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  };

  const handleDeleteAstrologer = async (astro: any) => {
    if (!confirm(`Are you sure you want to delete astrologer "${astro.fullName || astro.name}"?`)) return;
    try {
      await adminFetch(`/astrologers/${astro.id}`, { method: "DELETE" });
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to delete");
    }
  };

  // Tab filtering logic
  const getFilteredData = () => {
    let list = applications;
    if (activeTab === "APPLICATIONS") {
      list = applications.filter((a) => ["SUBMITTED", "PENDING_REVIEW", "UNDER_REVIEW", "SHORTLISTED", "ON_HOLD"].includes(a.status));
    } else if (activeTab === "ROUND_1") {
      list = applications.filter((a) => a.status === "INTERVIEW_ROUND_1");
    } else if (activeTab === "ROUND_2") {
      list = applications.filter((a) => a.status === "INTERVIEW_ROUND_2");
    } else if (activeTab === "VERIFICATION") {
      list = applications.filter((a) => ["DOCUMENTS_PENDING", "NEED_MORE_DOCUMENTS"].includes(a.status));
    } else if (activeTab === "APPROVED") {
      list = applications.filter((a) => a.status === "APPROVED");
    } else if (activeTab === "REJECTED") {
      list = applications.filter((a) => a.status === "REJECTED");
    } else if (activeTab === "INACTIVE") {
      list = applications.filter((a) => ["DEACTIVATED", "SUSPENDED"].includes(a.status));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          (a.full_name || "").toLowerCase().includes(q) ||
          (a.display_name || "").toLowerCase().includes(q) ||
          (a.email || "").toLowerCase().includes(q) ||
          (a.mobile || "").includes(q)
      );
    }
    return list;
  };

  const getFilteredLiveAstrologers = () => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return liveAstrologers.filter(
        (a) =>
          (a.fullName || "").toLowerCase().includes(q) ||
          (a.phone || "").includes(q) ||
          (a.title || "").toLowerCase().includes(q)
      );
    }
    return liveAstrologers;
  };

  return (
    <div className="space-y-6 text-[#3C3024] font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#5B1F24]/10 p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-[#5B1F24] font-serif flex items-center gap-2">
            <Award className="w-5 h-5 text-[#C8A044]" /> Astrologer Management Console
          </h2>
          <p className="text-xs text-amber-900/60 font-medium mt-0.5">
            Manage applicant vetting, schedule phone/video interviews, verify documents & monitor active profiles
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#FAF7F2] border border-[#5B1F24]/20 rounded-xl pl-9 pr-4 py-1.5 text-xs text-[#3C3024] focus:outline-none focus:border-[#5B1F24] w-64 font-semibold"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-[#5B1F24]/10 pb-2 scrollbar-none">
        {[
          { id: "APPLICATIONS", label: "Applications" },
          { id: "ROUND_1", label: "Round 1" },
          { id: "ROUND_2", label: "Round 2" },
          { id: "VERIFICATION", label: "Verification" },
          { id: "APPROVED", label: "Approved" },
          { id: "LIVE", label: "Live Astrologers" },
          { id: "REJECTED", label: "Rejected" },
          { id: "INACTIVE", label: "Inactive" },
          { id: "CALENDAR", label: "Interview Calendar", icon: Calendar },
          { id: "LOGS", label: "Activity Logs", icon: History }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "bg-[#5B1F24] text-white font-bold shadow-sm"
                  : "bg-white text-amber-900/70 border border-[#5B1F24]/10 hover:bg-amber-50"
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main List tables */}
      <div className="bg-white border border-[#5B1F24]/10 rounded-2xl shadow-sm overflow-hidden text-xs">
        {loading ? (
          <div className="text-center py-12 text-gray-500 font-semibold">Synchronizing records...</div>
        ) : activeTab === "LIVE" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#FAF7F2] text-amber-900/80 uppercase font-bold border-b border-[#5B1F24]/10">
                <tr>
                  <th className="p-4">Astrologer</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {getFilteredLiveAstrologers().length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-400">No live astrologers registered yet.</td>
                  </tr>
                ) : (
                  getFilteredLiveAstrologers().map((astro) => (
                    <tr key={astro.id} className="hover:bg-amber-50/20">
                      <td className="p-4 flex items-center gap-3">
                        <img src={astro.imageUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2"} alt="" className="w-8 h-8 rounded-full object-cover border border-[#C8A044]" />
                        <div>
                          <p className="font-bold text-[#5B1F24]">{astro.fullName || astro.name}</p>
                          <p className="text-[10px] text-gray-450">{astro.title}</p>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-gray-650">{astro.email}</td>
                      <td className="p-4 font-semibold text-gray-650">{astro.phone}</td>
                      <td className="p-4 font-bold text-[#C8A044]">{astro.rating || 5.0} ★</td>
                      <td className="p-4 font-semibold text-gray-700">₹{astro.pricePerMin || 20}/min</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${astro.status === "ACTIVE" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
                          {astro.status}
                        </span>
                      </td>
                      <td className="p-4 text-right flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(astro)}
                          className="p-1.5 hover:bg-amber-50 rounded-lg text-[#5B1F24]"
                          title={astro.status === "ACTIVE" ? "Block Access" : "Unblock Access"}
                        >
                          {astro.status === "ACTIVE" ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteAstrologer(astro)}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-red-600"
                          title="Delete Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : activeTab === "CALENDAR" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#FAF7F2] text-amber-900/80 uppercase font-bold border-b border-[#5B1F24]/10">
                <tr>
                  <th className="p-4">Candidate</th>
                  <th className="p-4">App Number</th>
                  <th className="p-4">Round</th>
                  <th className="p-4">Scheduled Date</th>
                  <th className="p-4">Scheduled Time</th>
                  <th className="p-4">Meeting Link</th>
                  <th className="p-4">Interviewer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {scheduledCalendar.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-400">No scheduled interviews found.</td>
                  </tr>
                ) : (
                  scheduledCalendar.map((iv) => (
                    <tr key={iv.id} className="hover:bg-amber-50/20">
                      <td className="p-4 font-bold text-[#5B1F24]">{iv.candidateName}</td>
                      <td className="p-4 font-mono font-bold text-amber-800">{iv.appNumber}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">
                          Round {iv.round_number} ({iv.round_type})
                        </span>
                      </td>
                      <td className="p-4 font-bold">{iv.scheduled_date}</td>
                      <td className="p-4 font-semibold text-gray-700">{iv.scheduled_time}</td>
                      <td className="p-4">
                        {iv.meeting_link ? (
                          <a href={iv.meeting_link} target="_blank" rel="noreferrer" className="text-[#5B1F24] font-bold underline flex items-center gap-1">
                            Join Meet <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : "N/A"}
                      </td>
                      <td className="p-4 text-gray-600 font-semibold">{iv.interviewer_name}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : activeTab === "LOGS" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#FAF7F2] text-amber-900/80 uppercase font-bold border-b border-[#5B1F24]/10">
                <tr>
                  <th className="p-4">Candidate</th>
                  <th className="p-4">App Number</th>
                  <th className="p-4">Transition</th>
                  <th className="p-4">Reason / Notes</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {historyLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400">No activity logs found.</td>
                  </tr>
                ) : (
                  historyLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-amber-50/20">
                      <td className="p-4 font-bold text-[#5B1F24]">{log.candidateName}</td>
                      <td className="p-4 font-mono font-bold text-amber-800">{log.appNumber}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px] font-bold">
                          {log.from_status} → {log.to_status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-700 italic">"{log.reason || "No remarks logged"}"</td>
                      <td className="p-4 text-[10px] text-gray-500 font-semibold">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#FAF7F2] text-amber-900/80 uppercase font-bold border-b border-[#5B1F24]/10">
                <tr>
                  <th className="p-4">Candidate</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Experience</th>
                  <th className="p-4">Expertise</th>
                  <th className="p-4">Languages</th>
                  <th className="p-4">Current Stage</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {getFilteredData().length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-400">No candidates found in this stage.</td>
                  </tr>
                ) : (
                  getFilteredData().map((app) => (
                    <tr key={app.id} className="hover:bg-amber-50/20">
                      <td className="p-4 flex items-center gap-3">
                        <img src={app.profile_picture_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2"} alt="" className="w-8 h-8 rounded-full object-cover border border-[#C8A044]" />
                        <div>
                          <p className="font-bold text-[#5B1F24]">{app.display_name || app.full_name}</p>
                          <p className="text-[10px] text-amber-800 font-mono font-bold">{app.application_number}</p>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-semibold text-gray-650">{app.mobile || "N/A"}</td>
                      <td className="p-4 font-bold text-gray-700">{app.years_experience || 0} Years</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {(app.primary_expertise || []).slice(0, 2).map((exp: string) => (
                            <span key={exp} className="px-2 py-0.5 rounded bg-amber-50 text-[#5B1F24] text-[10px] font-bold border border-[#5B1F24]/10">
                              {exp}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-gray-650 font-semibold">{app.languages?.join(", ")}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-100 text-[#5B1F24] border border-[#C8A044]/30">
                          {app.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => openDossier(app.id)}
                          className="px-3.5 py-1.5 bg-[#5B1F24] hover:bg-[#7A2A30] text-white font-bold rounded-xl text-[10px] flex items-center gap-1 ml-auto shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Dossier
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dossier Inspector Dialog */}
      {selectedAppId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border-2 border-[#5B1F24]/10 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative text-xs">
            <button
              onClick={() => setSelectedAppId(null)}
              className="absolute top-6 right-6 p-2 bg-[#FAF6F0] hover:bg-amber-100 text-[#5B1F24] rounded-full border border-[#5B1F24]/10 font-bold"
            >
              ✕
            </button>

            {dossierLoading || !dossier ? (
              <div className="py-20 text-center text-[#5B1F24] font-bold flex items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-[#C8A044]" /> Fetching Dossier Records...
              </div>
            ) : (
              <>
                {/* Dossier header info */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-amber-950/10 pb-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={dossier.application.profile_picture_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2"}
                      alt=""
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#C8A044] shadow-md"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-[#5B1F24] font-serif">{dossier.application.display_name || dossier.application.full_name}</h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-150 border border-[#C8A044]/30 text-amber-900 font-mono text-[9px] font-bold">
                          {dossier.application.application_number}
                        </span>
                      </div>
                      <p className="text-amber-900/60 text-xs font-semibold mt-1">
                        {dossier.application.email} • {dossier.application.mobile}
                      </p>
                    </div>
                  </div>

                  <span className="px-3.5 py-1 bg-amber-100 border border-[#C8A044]/40 text-[#5B1F24] rounded-full font-bold">
                    {dossier.application.status}
                  </span>
                </div>

                {/* Sub tabs inside dossier */}
                <div className="flex overflow-x-auto gap-2 border-b border-[#5B1F24]/10 pb-2 scrollbar-none">
                  {[
                    { id: "INFO", label: "Candidate Info" },
                    { id: "DOCS", label: `Documents (${dossier.documents.length})` },
                    { id: "INTERVIEWS", label: `Interview Rounds (${dossier.interviews.length})` },
                    { id: "NOTES", label: `Remarks (${dossier.notes.length})` },
                    { id: "STATUS", label: "Status Action" },
                    { id: "ACTIVATE", label: "🚀 Profile Activation" }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setDossierTab(t.id as any)}
                      className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                        dossierTab === t.id ? "bg-[#5B1F24] text-white font-bold shadow-sm" : "bg-[#FAF6F0] text-amber-900/70 border border-[#5B1F24]/10 hover:bg-amber-100"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Info Tab */}
                {dossierTab === "INFO" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[#3C3024] font-medium">
                    <div className="bg-[#FAF6F0]/40 p-4 rounded-2xl border border-[#5B1F24]/10 space-y-2">
                      <h4 className="font-bold text-[#5B1F24] uppercase tracking-wider text-[10px] font-serif">Credential Summary</h4>
                      <p><strong>Experience:</strong> {dossier.application.years_experience} Years</p>
                      <p><strong>Primary Skills:</strong> {dossier.application.primary_expertise?.join(", ")}</p>
                      <p><strong>Languages:</strong> {dossier.application.languages?.join(", ")}</p>
                      <p><strong>Study Lineage:</strong> {dossier.application.learned_from}</p>
                      <p><strong>Background Notes:</strong> {dossier.application.background_description || "N/A"}</p>
                    </div>

                    <div className="bg-[#FAF6F0]/40 p-4 rounded-2xl border border-[#5B1F24]/10 space-y-2">
                      <h4 className="font-bold text-[#5B1F24] uppercase tracking-wider text-[10px] font-serif">Financial & Identity</h4>
                      <p><strong>Aadhaar #:</strong> {dossier.application.aadhaar_number || "Not provided"}</p>
                      <p><strong>PAN #:</strong> {dossier.application.pan_number || "Not provided"}</p>
                      <p><strong>Bank A/C Holder:</strong> {dossier.application.bank_account_holder_name || "Not provided"}</p>
                      <p><strong>Bank A/C #:</strong> {dossier.application.bank_account_number || "Not provided"}</p>
                      <p><strong>Bank IFSC:</strong> {dossier.application.bank_ifsc || "Not provided"}</p>
                    </div>

                    <div className="md:col-span-2 bg-[#FAF6F0]/40 p-4 rounded-2xl border border-[#5B1F24]/10 space-y-2">
                      <h4 className="font-bold text-[#5B1F24] uppercase tracking-wider text-[10px] font-serif">Public Bio & Intro Media</h4>
                      <p className="italic text-gray-700">"{dossier.application.bio || "No public bio logged"}"</p>
                      {dossier.application.intro_video_url && (
                        <p className="text-[#5B1F24] font-bold flex items-center gap-1.5 mt-2">
                          <Video className="w-4 h-4 text-[#C8A044]" /> Video Introduction: <a href={dossier.application.intro_video_url} target="_blank" rel="noreferrer" className="underline">{dossier.application.intro_video_url}</a>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Documents Tab */}
                {dossierTab === "DOCS" && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-[#5B1F24] font-serif">Checklist & Document Verifications</h3>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Log rejection or re-upload feedback remarks..."
                        value={docRejectionReason}
                        onChange={(e) => setDocRejectionReason(e.target.value)}
                        className="flex-1 bg-[#FAF6F0]/50 border border-[#5B1F24]/20 p-2 rounded-xl text-xs outline-none"
                      />
                    </div>

                    {dossier.documents.length === 0 ? (
                      <p className="text-gray-400 p-4 bg-amber-50/20 text-center rounded-xl">No documents uploaded yet.</p>
                    ) : (
                      dossier.documents.map((doc: any) => (
                        <div key={doc.id} className="p-4 bg-[#FAF6F0]/30 border border-[#5B1F24]/10 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-semibold">
                          <div>
                            <p className="font-bold text-[#5B1F24]">{doc.document_type.replace(/_/g, " ")}</p>
                            <p className="text-[10px] text-amber-900/60 mt-0.5">Status: {doc.status}</p>
                            {doc.file_path && (
                              <a href={doc.file_path} target="_blank" rel="noreferrer" className="text-amber-800 text-[10px] underline block mt-1">
                                View File Asset
                              </a>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleReviewDoc(doc.id, "APPROVED")}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] shadow-xs cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReviewDoc(doc.id, "REJECTED")}
                              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[10px] shadow-xs cursor-pointer"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleReviewDoc(doc.id, "REUPLOAD_REQUESTED")}
                              className="px-3 py-1 bg-[#C8A044] hover:bg-[#b08b39] text-white font-bold rounded-lg text-[10px] shadow-xs cursor-pointer"
                            >
                              Request Reupload
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Interviews Tab */}
                {dossierTab === "INTERVIEWS" && (
                  <div className="space-y-6">
                    <div className="p-4 bg-[#FAF6F0]/40 border border-[#5B1F24]/10 rounded-2xl space-y-4">
                      <h4 className="font-bold text-[#5B1F24] font-serif">Schedule Evaluation Round</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] text-gray-500 font-bold mb-1">Round Number</label>
                          <select
                            value={interviewForm.roundNumber}
                            onChange={(e) => setInterviewForm({ ...interviewForm, roundNumber: parseInt(e.target.value) })}
                            className="w-full bg-white border border-[#5B1F24]/20 p-2 rounded-xl text-[#3C3024] font-semibold outline-none"
                          >
                            <option value={1}>Round 1 (Phone)</option>
                            <option value={2}>Round 2 (Video)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 font-bold mb-1">Interview Date</label>
                          <input
                            type="date"
                            value={interviewForm.scheduledDate}
                            onChange={(e) => setInterviewForm({ ...interviewForm, scheduledDate: e.target.value })}
                            className="w-full bg-white border border-[#5B1F24]/20 p-2 rounded-xl text-[#3C3024] font-semibold outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 font-bold mb-1">Scheduled Time Slot</label>
                          <input
                            type="text"
                            placeholder="e.g. 3:30 PM"
                            value={interviewForm.scheduledTime}
                            onChange={(e) => setInterviewForm({ ...interviewForm, scheduledTime: e.target.value })}
                            className="w-full bg-white border border-[#5B1F24]/20 p-2 rounded-xl text-[#3C3024] font-semibold outline-none"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-[10px] text-gray-500 font-bold mb-1">Google Meet / Zoom Meeting Link (For Round 2 Video)</label>
                          <input
                            type="text"
                            placeholder="https://meet.google.com/abc-defg-hij"
                            value={interviewForm.meetingLink}
                            onChange={(e) => setInterviewForm({ ...interviewForm, meetingLink: e.target.value })}
                            className="w-full bg-white border border-[#5B1F24]/20 p-2 rounded-xl text-[#3C3024] font-semibold outline-none"
                          />
                        </div>
                      </div>
                      <button
                        onClick={handleScheduleInterview}
                        className="px-4 py-2 bg-[#5B1F24] hover:bg-[#7A2A30] text-white font-bold rounded-xl shadow-xs"
                      >
                        Schedule Round
                      </button>
                    </div>

                    {/* Record Score Evaluation Form */}
                    {dossier.interviews.some((i: any) => i.status === "PENDING") && (
                      <div className="p-4 bg-[#FAF6F0]/40 border border-[#5B1F24]/10 rounded-2xl space-y-4">
                        <h4 className="font-bold text-[#5B1F24] font-serif">Submit Score Evaluation</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] text-gray-500 font-bold mb-1">Choose Round</label>
                            <select
                              value={evalForm.interviewId}
                              onChange={(e) => setEvalForm({ ...evalForm, interviewId: e.target.value })}
                              className="w-full bg-white border border-[#5B1F24]/20 p-2 rounded-xl text-[#3C3024] font-semibold outline-none"
                            >
                              <option value="">-- Select Pending Round --</option>
                              {dossier.interviews.filter((i: any) => i.status === "PENDING").map((i: any) => (
                                <option key={i.id} value={i.id}>Round {i.round_number} ({i.round_type})</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-500 font-bold mb-1">Communication (1-10)</label>
                            <input
                              type="number"
                              value={evalForm.scoreCommunication}
                              onChange={(e) => setEvalForm({ ...evalForm, scoreCommunication: parseInt(e.target.value) })}
                              className="w-full bg-white border border-[#5B1F24]/20 p-2 rounded-xl text-[#3C3024] font-semibold outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-500 font-bold mb-1">Astrology Knowledge (1-10)</label>
                            <input
                              type="number"
                              value={evalForm.scoreKnowledge}
                              onChange={(e) => setEvalForm({ ...evalForm, scoreKnowledge: parseInt(e.target.value) })}
                              className="w-full bg-white border border-[#5B1F24]/20 p-2 rounded-xl text-[#3C3024] font-semibold outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-500 font-bold mb-1">Result Decision</label>
                            <select
                              value={evalForm.result}
                              onChange={(e) => setEvalForm({ ...evalForm, result: e.target.value })}
                              className="w-full bg-white border border-[#5B1F24]/20 p-2 rounded-xl text-[#3C3024] font-semibold outline-none"
                            >
                              <option value="PASS">PASS</option>
                              <option value="FAIL">FAIL</option>
                              <option value="HOLD">HOLD</option>
                            </select>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] text-gray-500 font-bold mb-1">Review Remarks</label>
                            <input
                              type="text"
                              placeholder="Remarks on candidate performance..."
                              value={evalForm.remarks}
                              onChange={(e) => setEvalForm({ ...evalForm, remarks: e.target.value })}
                              className="w-full bg-white border border-[#5B1F24]/20 p-2 rounded-xl text-[#3C3024] font-semibold outline-none"
                            />
                          </div>
                        </div>
                        <button
                          onClick={handleRecordEvaluation}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                        >
                          Submit Evaluation
                        </button>
                      </div>
                    )}

                    {dossier.interviews.map((item: any) => (
                      <div key={item.id} className="p-4 bg-[#FAF6F0]/30 border border-[#5B1F24]/10 rounded-2xl space-y-2 font-medium">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-[#5B1F24]">Round {item.round_number} ({item.round_type})</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${item.result === "PASS" ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>{item.result}</span>
                        </div>
                        <p>Score: {item.overall_score} / 10</p>
                        <p className="italic text-gray-500">"{item.remarks}"</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Notes Tab */}
                {dossierTab === "NOTES" && (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type internal remarks..."
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        className="flex-1 bg-[#FAF6F0]/50 border border-[#5B1F24]/20 p-2.5 rounded-xl text-[#3C3024] font-semibold outline-none"
                      />
                      <button
                        onClick={handleAddNote}
                        className="px-5 py-2.5 bg-[#5B1F24] hover:bg-[#7A2A30] text-white font-bold rounded-xl"
                      >
                        Log Note
                      </button>
                    </div>

                    {dossier.notes.map((n: any) => (
                      <div key={n.id} className="p-3 bg-[#FAF6F0]/30 border border-[#5B1F24]/10 rounded-xl font-medium text-[#3C3024]">
                        <p>{n.note}</p>
                        <span className="text-[9px] text-gray-400 block mt-1">{new Date(n.created_at).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Status transitions Tab */}
                {dossierTab === "STATUS" && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-[#5B1F24] font-serif">Workflow Lifecycle Actions</h3>
                    <div className="flex flex-wrap gap-2">
                      {(dossier.allowedTransitions || []).map((st: string) => (
                        <button
                          key={st}
                          onClick={() => handleStatusChange(st)}
                          className="px-4 py-2 bg-white text-[#5B1F24] hover:bg-[#5B1F24] hover:text-white font-bold rounded-xl border border-[#5B1F24]/20 transition-all cursor-pointer shadow-xs"
                        >
                          Transition to: {st}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Activate Profile Tab */}
                {dossierTab === "ACTIVATE" && (
                  <div className="p-6 bg-[#FAF6F0]/40 border border-[#C8A044]/30 rounded-3xl space-y-4">
                    <h3 className="text-lg font-extrabold text-[#5B1F24] font-serif flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#C8A044]" /> Final Approval: Go Live Setup
                    </h3>
                    <p className="text-[#3C3024] font-semibold">
                      This will create the public-facing astrologer profile, provision a financial wallet balance sheet, and toggle their status to Live.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-semibold text-[#3C3024]">
                      <div>
                        <label className="block text-[10px] text-gray-500 font-bold mb-1">Per-Minute Consultation Rate (₹/min)</label>
                        <input
                          type="number"
                          value={pricingForm.pricePerMin}
                          onChange={(e) => setPricingForm({ ...pricingForm, pricePerMin: Number(e.target.value) })}
                          className="w-full bg-white border border-[#5B1F24]/20 p-2.5 rounded-xl font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 font-bold mb-1">Platform Commission Pct (%)</label>
                        <input
                          type="number"
                          value={pricingForm.commissionPct}
                          onChange={(e) => setPricingForm({ ...pricingForm, commissionPct: Number(e.target.value) })}
                          className="w-full bg-white border border-[#5B1F24]/20 p-2.5 rounded-xl font-bold"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleActivateGoLive}
                      className="w-full py-4 text-white font-extrabold rounded-xl text-sm shadow-md active:scale-95 transition-all cursor-pointer"
                      style={{ background: "linear-gradient(135deg, #5B1F24, #7A2A30)" }}
                    >
                      🚀 MAKE LIVE / ACTIVATE ACCOUNT NOW
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default AstrologersPage;
