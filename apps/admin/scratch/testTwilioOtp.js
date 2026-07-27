import dotenv from "dotenv";
dotenv.config();
import { sendOtp, verifyOtp } from "../server/services/twilioService.js";

async function runTests() {
  console.log("=== Testing Twilio OTP Verification Logic ===");
  const testMobile = "7505298939";

  // Test 1: Verify OTP when no OTP has been requested
  try {
    await verifyOtp(testMobile, "999999");
    console.error("FAIL: Expected error for unrequested OTP");
  } catch (err) {
    console.log("PASS: Unrequested OTP caught error:", err.message);
  }

  // Test 2: Attempting sendOtp
  try {
    console.log("Attempting sendOtp for +91 86190 37218...");
    const res = await sendOtp(testMobile);
    console.log("sendOtp response:", res);
  } catch (err) {
    console.log("sendOtp caught expected Twilio response/error:", err.message);
  }

  // Test 3: Invalid OTP attempt
  try {
    await verifyOtp(testMobile, "000000");
    console.error("FAIL: Expected error for invalid OTP code");
  } catch (err) {
    console.log("PASS: Invalid OTP code caught error:", err.message);
  }

  console.log("=== Twilio OTP Unit Logic Test Complete ===");
}

runTests();
