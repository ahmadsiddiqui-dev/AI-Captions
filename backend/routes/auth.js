const express = require("express");
const router = express.Router();
const {
  register,
  verifyOtp,
  login,
  resendOtp,
  logout,
  forgotPassword,
  resetPassword,
  updateName   
} = require("../controllers/authController");

const auth = require("../middleware/auth"); 

// Register user (send OTP)
router.post("/register", register);

// Verify OTP
router.post("/verify-otp", verifyOtp);

// Login user
router.post("/login", login);

// Resend OTP
router.post("/resend-otp", resendOtp);

// Logout user
router.post("/logout", logout);

// Forgot password (send OTP)
router.post("/forgot-password", forgotPassword);

// Reset password
router.post("/reset-password", resetPassword);

// UPDATE NAME (NEW)
router.post("/update-name", auth, updateName);

module.exports = router;
