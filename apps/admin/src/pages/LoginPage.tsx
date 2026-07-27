import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Phone, Mail, User, ShieldCheck, ArrowRight, CheckCircle2, X, Star, Sparkles, Shield } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");

  const [mobileNumber, setMobileNumber] = useState("");
  const [mpin, setMpin] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [showOtpBox, setShowOtpBox] = useState(false);
  const [isMobileVerified, setIsMobileVerified] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber.trim() || mobileNumber.replace(/\D/g, "").length !== 10) return setErrorMsg("Enter valid 10-digit mobile");
    if (!mpin.trim() || mpin.length < 4) return setErrorMsg("Enter valid MPIN");
    setIsLoading(true); setErrorMsg(""); setInfoMsg("");
    try { await login(mobileNumber, mpin); navigate("/dashboard"); }
    catch (err: any) { setErrorMsg(err.message || "Invalid credentials"); }
    finally { setIsLoading(false); }
  };

  const handleSendOtpInline = () => {
    if (!mobileNumber.trim() || mobileNumber.replace(/\D/g, "").length !== 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number to verify.");
      return;
    }
    setErrorMsg("");
    setShowOtpBox(true);
    setInfoMsg("Verification OTP sent to mobile number.");
  };

  const handleConfirmOtpInline = () => {
    if (otp.trim() !== "111111" && otp.trim() !== "123456") {
      setErrorMsg("Invalid OTP code. Please enter 111111 to verify.");
      return;
    }
    setErrorMsg("");
    setIsMobileVerified(true);
    setShowOtpBox(false);
    setInfoMsg("Mobile number verified successfully! ✓");
  };

  const handleCreateAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setErrorMsg("Full Name is required");
    if (!mobileNumber.trim() || mobileNumber.replace(/\D/g, "").length !== 10) return setErrorMsg("Enter valid 10-digit mobile");
    if (!isMobileVerified && otp.trim() !== "111111" && otp.trim() !== "123456") {
      return setErrorMsg("Please click 'Verify OTP' on the side of your mobile number and enter code 111111");
    }
    if (!mpin.trim() || mpin.length < 4) return setErrorMsg("MPIN must be at least 4 digits");

    setIsLoading(true); setErrorMsg(""); setInfoMsg("");
    try {
      await register({ name, mobileNumber, email, mpin, otp: "111111" });
      navigate("/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create admin account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      {/* Top Header Bar */}
      <header className="w-full h-16 bg-white/90 backdrop-blur-md border-b border-[#5B1F24]/10 px-6 sm:px-10 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#5B1F24] text-[#FAF7F2] flex items-center justify-center text-sm font-bold shadow-xs">
            🕉️
          </div>
          <span className="text-lg font-bold text-[#5B1F24] tracking-tight" style={{ fontFamily: "Cinzel, serif" }}>
            Aroham Admin Portal
          </span>
        </div>

        <button
          onClick={() => navigate("/")}
          className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
          title="Close"
        >
          <X size={18} />
        </button>
      </header>

      {/* Main Split Content Section */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side Visual Hero Banner */}
        <div className="hidden md:flex md:w-1/2 lg:w-[50%] relative overflow-hidden flex-col justify-between p-10 lg:p-14 text-white">
          {/* Background Image & Dark Overlay */}
          <img
            src="/images/auth-bg.png"
            alt="Aroham Admin Portal Background"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30" />

          {/* Top Pill Badge */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider text-amber-300 border border-amber-400/30 bg-black/40 backdrop-blur-md shadow-xs">
              <Sparkles size={13} className="text-amber-400" />
              <span>SACRED VEDIC ECOSYSTEM</span>
            </div>
          </div>

          {/* Bottom Hero Text & Admin Feature Badges */}
          <div className="relative z-10 space-y-6">
            {/* Rating Banner */}
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-2xl w-fit">
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill="#FBBF24" stroke="#FBBF24" />
                ))}
              </div>
              <div className="text-xs">
                <span className="font-bold text-white">4.9 / 5 Rating</span>
                <span className="text-white/70 ml-1.5">Trusted by 50,000+ seekers</span>
              </div>
            </div>

            {/* Main Headline */}
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white mb-3" style={{ fontFamily: "Cinzel, serif" }}>
                Welcome Back.
              </h1>
              <p className="text-sm lg:text-base text-white/80 max-w-lg leading-relaxed">
                Continue your sacred journey toward harmony, prosperity and divine energy.
              </p>
            </div>

            {/* Custom Admin Feature Badges */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              {[
                "Product Management",
                "User Management",
                "Astrologer Management"
              ].map((badge) => (
                <div
                  key={badge}
                  className="px-4 py-2 rounded-full text-xs font-semibold bg-white/12 backdrop-blur-md border border-white/25 text-white flex items-center gap-2 shadow-xs"
                >
                  <CheckCircle2 size={14} className="text-amber-400" />
                  <span>{badge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side Form Card */}
        <div className="w-full md:w-1/2 lg:w-[50%] flex items-center justify-center p-6 md:p-12 relative bg-[#FAF7F2] overflow-y-auto">
          <div className="max-w-md w-full bg-white rounded-[2.25rem] p-8 shadow-xl border border-[#5B1F24]/10 space-y-6">
            {/* Sign In / Create Account Toggle */}
            <div className="flex rounded-2xl p-1 bg-[#5B1F24]/5 border border-[#5B1F24]/10">
              <button
                type="button"
                onClick={() => { setActiveTab("signin"); setErrorMsg(""); setInfoMsg(""); setMobileNumber(""); setMpin(""); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "signin"
                    ? "bg-[#5B1F24] text-white shadow-md"
                    : "text-gray-600 hover:text-[#5B1F24]"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab("signup"); setErrorMsg(""); setInfoMsg(""); setMobileNumber(""); setMpin(""); setName(""); setEmail(""); setOtp(""); setIsMobileVerified(false); setShowOtpBox(false); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "signup"
                    ? "bg-[#5B1F24] text-white shadow-md"
                    : "text-gray-600 hover:text-[#5B1F24]"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Title Header */}
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl font-bold text-[#5B1F24] tracking-tight" style={{ fontFamily: "Cinzel, serif" }}>
                {activeTab === "signin" ? "Welcome Back" : "Create Admin Account"}
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                {activeTab === "signin"
                  ? "Enter your mobile number to sign in to your account"
                  : "Enter your full name and mobile number to get started"}
              </p>
            </div>

            {/* Error & Info Messages */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-[#d4183d]/10 border border-[#d4183d]/20 text-[#d4183d] text-xs font-semibold flex items-center gap-2">
                <ShieldCheck size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {infoMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                <span>{infoMsg}</span>
              </div>
            )}

            {activeTab === "signin" ? (
              /* Sign In Form */
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#5B1F24] mb-1">Mobile Number</label>
                  <div className="flex items-center rounded-2xl overflow-hidden bg-white border border-gray-200 focus-within:border-[#5B1F24] transition-colors">
                    <span className="px-3.5 py-3 text-xs font-bold border-r flex items-center gap-1.5 shrink-0 bg-gray-50 text-[#5B1F24] border-gray-200">
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={mobileNumber}
                      onChange={e => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                      className="flex-1 px-3.5 py-3 text-xs font-semibold outline-none bg-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5B1F24] mb-1">Secret MPIN</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                    <input
                      type="password"
                      maxLength={6}
                      placeholder="Enter MPIN"
                      value={mpin}
                      onChange={e => setMpin(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 bg-[#FAF7F2] border border-gray-200 rounded-2xl text-xs font-semibold outline-none focus:border-[#5B1F24] transition-colors"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-2xl bg-[#5B1F24] hover:bg-[#7A2A30] text-white font-bold text-xs tracking-wide shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <Lock size={14} />
                  <span>{isLoading ? "Authenticating..." : "Sign In"}</span>
                </button>
              </form>
            ) : (
              /* Create Account Form */
              <form onSubmit={handleCreateAccountSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#5B1F24] mb-1">Full Name</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Admin Full Name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full h-10 pl-9 pr-3 bg-[#FAF7F2] border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-[#5B1F24]"
                      required
                    />
                  </div>
                </div>

                {/* Mobile Field with Inline Verify OTP button */}
                <div>
                  <label className="block text-xs font-bold text-[#5B1F24] mb-1">Mobile Number</label>
                  <div className="flex gap-2">
                    <div className="flex flex-1 items-center rounded-xl overflow-hidden bg-white border border-gray-200 focus-within:border-[#5B1F24]">
                      <span className="px-2.5 py-2.5 text-xs font-bold border-r shrink-0 bg-gray-50 text-[#5B1F24] border-gray-200">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        value={mobileNumber}
                        onChange={e => {
                          setMobileNumber(e.target.value.replace(/\D/g, ""));
                          setIsMobileVerified(false);
                        }}
                        className="w-full h-10 px-3 text-xs font-semibold outline-none bg-transparent"
                        required
                      />
                    </div>
                    {isMobileVerified ? (
                      <span className="h-10 px-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 text-xs font-bold shrink-0">
                        <CheckCircle2 size={14} className="text-emerald-600" /> Verified
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtpInline}
                        disabled={mobileNumber.length !== 10}
                        className="h-10 px-3 rounded-xl bg-[#5B1F24] text-white font-bold text-xs shadow-xs hover:bg-[#7A2A30] transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <span>Verify OTP</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline OTP Box */}
                {showOtpBox && !isMobileVerified && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#5B1F24]">Enter 6-Digit OTP</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                        className="flex-1 h-9 px-3 text-center font-bold tracking-widest bg-white border border-amber-900/30 rounded-lg text-xs font-mono outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleConfirmOtpInline}
                        className="h-9 px-3.5 rounded-lg bg-emerald-700 text-white font-bold text-xs shadow-xs hover:bg-emerald-800 shrink-0"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#5B1F24] mb-1">Email Address (Optional)</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-3 text-gray-400" />
                    <input
                      type="email"
                      placeholder="admin@aroham.in"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full h-10 pl-9 pr-3 bg-[#FAF7F2] border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-[#5B1F24]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5B1F24] mb-1">Create Secret MPIN</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-3 text-gray-400" />
                    <input
                      type="password"
                      maxLength={6}
                      placeholder="4-6 digit MPIN"
                      value={mpin}
                      onChange={e => setMpin(e.target.value)}
                      className="w-full h-10 pl-9 pr-3 bg-[#FAF7F2] border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-[#5B1F24]"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-2xl bg-[#5B1F24] hover:bg-[#7A2A30] text-white font-bold text-xs tracking-wide shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <Shield size={14} />
                  <span>{isLoading ? "Creating Account..." : "Create Admin Account"}</span>
                </button>
              </form>
            )}

            {/* Terms and Privacy text */}
            <p className="text-[11px] text-center text-gray-500 leading-relaxed px-2">
              By continuing, you agree to Aroham's{" "}
              <a href="#" onClick={e => e.preventDefault()} className="font-semibold underline decoration-dotted text-[#5B1F24]">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" onClick={e => e.preventDefault()} className="font-semibold underline decoration-dotted text-[#5B1F24]">
                Privacy Policy
              </a>
            </p>

            {/* Bottom Security Footer */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-center gap-3 text-[10px] font-semibold text-gray-400">
              <span className="flex items-center gap-1"><Lock size={10} /> Secure</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Shield size={10} /> Encrypted</span>
              <span>•</span>
              <span className="flex items-center gap-1">⚡ Admin Auth</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
