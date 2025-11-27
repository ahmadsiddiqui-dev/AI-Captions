const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const otpStore = new Map();

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// EMAIL VALIDATION REGEX
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ============ SEND OTP EMAIL (Dynamic HTML) ============
const sendOtpEmail = async (email, otp, name, type) => {
 const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

  // DYNAMIC SUBJECT & MESSAGE
  const isRegister = type === "register";
  const subject = isRegister
    ? "Verify Your Email - AI Caption"
    : "Reset Your Password - AI Caption";

  const heading = isRegister ? "Verify Your Email" : "Reset Your Password";

  const bodyMessage = isRegister
    ? "Welcome to AI Caption! Please verify your email using the OTP below:"
    : "Use the OTP below to reset your password:";

  const mailTemplate = `
    <div style="font-family: Arial; background-color: #f4f4f4; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background: #fff; padding: 25px; border-radius: 10px; border: 1px solid #e0e0e0;">

        <h2 style="color: #8d69e0; text-align: center;">AI Caption</h2>

        <p style="font-size: 16px; color: #333;">Hi ${name || "there"},</p>

        <p style="font-size: 15px; color: #555;">
          ${bodyMessage}
        </p>

        <div style="text-align: center; margin: 25px 0;">
          <span style="display: inline-block; padding: 15px 25px; font-size: 26px; font-weight: bold; color: white; background-color: #8d69e0; border-radius: 8px;">
            ${otp}
          </span>
        </div>

        <p style="font-size: 14px; color: #555;">
          This OTP expires in <strong>5 minutes</strong>.
        </p>

        <p style="margin-top: 25px; font-size: 14px; color: #777;">
          If you didn’t request this, you can safely ignore this email.
        </p>

      </div>
    </div>
  `;

  const mailOptions = {
    from: `"${process.env.EMAIL_NAME || "AI Caption"}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html: mailTemplate,
  };

  try {
  await transporter.sendMail(mailOptions);
  console.log("📨 Email sent successfully to:", email);
} catch (error) {
  console.log("❌ Failed to send email:", error.message);
  throw new Error(error.message || "Email sending failed");
}

};

// ===================== REGISTER =====================
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "Password must follow requirements",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, {
      otp,
      name,
      password,
      expires: Date.now() + 5 * 60 * 1000,
    });

    await sendOtpEmail(email, otp, name, "register");

    return res.status(200).json({ message: "Enter the OTP sent to your email." });

  } catch (err) {
    return res.status(500).json({ message: "Failed to send OTP", error: err.message });
  }
};

// ===================== VERIFY OTP =====================
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const stored = otpStore.get(email);

    if (!stored) return res.status(400).json({ message: "OTP not found or expired." });
    if (Date.now() > stored.expires) {
      otpStore.delete(email);
      return res.status(400).json({ message: "OTP expired." });
    }

    if (stored.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP." });

    const hashedPassword = await bcrypt.hash(stored.password, 10);

    const user = await User.create({
      name: stored.name,
      email,
      password: hashedPassword,
      isVerified: true,
    });

    const token = generateToken(user._id);

    otpStore.delete(email);

    return res.status(201).json({
      message: "Email verified successfully!",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });

  } catch (err) {
    return res.status(500).json({ message: "OTP verification failed", error: err.message });
  }
};

// ===================== LOGIN =====================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = generateToken(user._id);

    return res.status(200).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });

  } catch (err) {
    return res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// ===================== LOGOUT =====================
exports.logout = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Logout failed",
      error: err.message,
    });
  }
};

// ===================== RESEND OTP =====================
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const stored = otpStore.get(email);
    if (!stored) {
      return res.status(400).json({ message: "No OTP request found. Please register again." });
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    stored.otp = newOtp;
    stored.expires = Date.now() + 5 * 60 * 1000;

    await sendOtpEmail(email, newOtp, stored.name, "register");

    return res.status(200).json({ message: "New OTP sent successfully!" });

  } catch (err) {
    return res.status(500).json({ message: "Failed to resend OTP", error: err.message });
  }
};

// ===================== FORGOT PASSWORD =====================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore.set(email, { otp, expires: Date.now() + 5 * 60 * 1000 });

    await sendOtpEmail(email, otp, user.name, "forgot");

    return res.status(200).json({ message: "Enter the OTP sent to your email." });

  } catch (err) {
    return res.status(500).json({ message: "Failed to send reset OTP", error: err.message });
  }
};

// ===================== RESET PASSWORD =====================
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const stored = otpStore.get(email);

    if (!stored || stored.otp !== otp || Date.now() > stored.expires) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message: "Password must follow requirements.",
      });
    }

    // CHECK IF NEW PASSWORD = OLD PASSWORD
    const user = await User.findOne({ email });
    if (user) {
      const isSame = await bcrypt.compare(newPassword, user.password);
      if (isSame) {
        return res.status(400).json({
          message: "New password cannot be same as old password",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ email }, { password: hashedPassword });

    otpStore.delete(email);

    return res.status(200).json({ message: "Password reset successful!" });

  } catch (err) {
    return res.status(500).json({ message: "Password reset failed", error: err.message });
  }
};


// ===================== UPDATE NAME =====================
exports.updateName = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name },
      { new: true }
    );

    return res.status(200).json({
      message: "Name updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email
      }
    });

  } catch (err) {
    return res.status(500).json({ message: "Failed to update name", error: err.message });
  }
};
