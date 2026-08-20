
function generateOtp() {
  // 6 digit numeric code
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function verifyOtp(inputOtp, expectedOtp) {
  if (!inputOtp || !expectedOtp) return false;
  return inputOtp.trim() === expectedOtp.trim();
}

module.exports = {
  generateOtp,
  verifyOtp
};
