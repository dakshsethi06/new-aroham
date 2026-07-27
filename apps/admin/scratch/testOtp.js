async function test() {
  const res = await fetch("http://localhost:5001/api/admin/auth/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobileNumber: "9568023451", otp: "111111" })
  });
  const data = await res.json();
  console.log("Verify OTP response:", data);
}

test().catch(console.error);
