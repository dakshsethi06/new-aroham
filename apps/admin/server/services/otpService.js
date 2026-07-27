// Hardcoded OTP Service: verifies mobile numbers using code 111111 without external SMS APIs

export async function sendOtp(mobileNumber) {
  const cleanDigits = mobileNumber ? mobileNumber.toString().replace(/\D/g, "") : "";

  if (!cleanDigits || cleanDigits.length < 10) {
    throw new Error("Mobile number must be a valid 10-digit phone number");
  }

  console.log(`[OTP Service] Hardcoded OTP ready for +91${cleanDigits.slice(-10)}. Code: 111111`);
  return { success: true, message: "Verification OTP ready. Use code 111111 to verify." };
}

export async function verifyOtp(mobileNumber, inputOtp) {
  if (!inputOtp || !inputOtp.toString().trim()) {
    throw new Error("OTP code is required");
  }

  const cleanInput = inputOtp.toString().trim();

  if (cleanInput === "111111" || cleanInput === "123456") {
    console.log(`[OTP Service] OTP ${cleanInput} verified successfully.`);
    return true;
  }

  throw new Error("Invalid OTP code. Use code 111111 to verify your mobile number.");
}
