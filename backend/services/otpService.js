// services/otpService.js — mock OTP generator/validator for development and onboarding registration
const mockOtps = new Map(); // mobile -> otp

async function sendOtp(countryCode, mobile) {
  const cleanMobile = mobile.trim();
  // Default testing OTP: "1234"
  mockOtps.set(cleanMobile, "1234");
  console.log(`[otpService] Dispatched verification code "1234" to ${countryCode} ${cleanMobile}`);
  return true;
}

function verifyOtp(countryCode, mobile, otp) {
  const cleanMobile = mobile.trim();
  const savedOtp = mockOtps.get(cleanMobile) || "1234"; // fallback default
  
  if (otp.trim() === savedOtp || otp.trim() === "1234") {
    mockOtps.delete(cleanMobile);
    return { valid: true };
  }
  
  return { valid: false, reason: "Incorrect OTP code. Try using '1234'." };
}

module.exports = {
  sendOtp,
  verifyOtp
};
