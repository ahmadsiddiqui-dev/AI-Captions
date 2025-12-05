import AsyncStorage from "@react-native-async-storage/async-storage";

// BASE URLs
const AUTH_URL = "https://ai-captions.onrender.com/api/auth";
const CAPTION_URL = "https://ai-captions.onrender.com/api/captions";


// ========== Register User ==========
export const registerUser = async (data) => {
  try {
    const res = await fetch(`${AUTH_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch {
    return { message: "Cannot connect to server" };
  }
};

// ========== Verify OTP ==========
export const verifyOtp = async (data) => {
  try {
    const res = await fetch(`${AUTH_URL}/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch {
    return { message: "Cannot connect to server" };
  }
};

// ========== Login ==========
export const loginUser = async (data) => {
  try {
    const res = await fetch(`${AUTH_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch {
    return { message: "Cannot connect to server" };
  }
};

// ========== Resend OTP ==========
export const resendOtp = async (data) => {
  try {
    const res = await fetch(`${AUTH_URL}/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch {
    return { message: "Cannot connect to server" };
  }
};

// ========== Forgot Password ==========
export const forgotPassword = async (data) => {
  try {
    const res = await fetch(`${AUTH_URL}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch {
    return { message: "Cannot connect to server" };
  }
};

// ========== Reset Password ==========
export const resetPassword = async (data) => {
  try {
    const res = await fetch(`${AUTH_URL}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch {
    return { message: "Cannot connect to server" };
  }
};

// ========== Logout ==========
export const logoutUser = async () => {
  try {
    const res = await fetch(`${AUTH_URL}/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    return await res.json();
  } catch {
    return { message: "Cannot connect to server" };
  }
};

// ========== Update Name ==========
export const updateName = async (newName) => {
  try {
    const token = await AsyncStorage.getItem("token");

    const res = await fetch(`${AUTH_URL}/update-name`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newName }),
    });

    return await res.json();
  } catch {
    return { message: "Cannot connect to server" };
  }
};

// ========== Generate Captions (AI) ==========
export const generateCaptions = async (formData) => {
  try {
    const token = await AsyncStorage.getItem("token");

    const res = await fetch(`${CAPTION_URL}/generate-captions`, {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
      body: formData, 
    });

    return await res.json();
  } catch {
    return { message: "Cannot connect to server" };
  }
};

// ====================== GOOGLE LOGIN ======================
export const googleAuth = async (idToken) => {
  try {
    const res = await fetch(`${AUTH_URL}/google-signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    return await res.json();
  } catch (err) {
    return { message: "Server error" };
  }
};