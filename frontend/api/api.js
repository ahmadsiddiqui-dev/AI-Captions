import AsyncStorage from "@react-native-async-storage/async-storage";
import { getOrCreateDeviceId } from "../utils/deviceId";


// BASE URLs
const AUTH_URL = "https://my-ai-captions.onrender.com/api/auth";
const CAPTION_URL = "https://my-ai-captions.onrender.com/api/captions";
const SUB_URL = "https://my-ai-captions.onrender.com/api/subscription";


// ========== Register User ==========
export const registerUser = async (data) => {
  try {
    const deviceId = await getOrCreateDeviceId();

    const res = await fetch(`${AUTH_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-device-id": deviceId,
      },
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
    const deviceId = await getOrCreateDeviceId();

    const res = await fetch(`${AUTH_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-device-id": deviceId,
      },
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
// export const generateCaptions = async (formData) => {
//   try {
//     const token = await AsyncStorage.getItem("token");

//     const res = await fetch(`${CAPTION_URL}/generate-captions`, {
//       method: "POST",
//       headers: {
//         Authorization: token ? `Bearer ${token}` : undefined,
//       },
//       body: formData, 
//     });

//     return await res.json();
//   } catch {
//     return { message: "Cannot connect to server" };
//   }
// };
export const generateCaptions = async (formData) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const deviceId = await getOrCreateDeviceId();

    console.log("SENDING DEVICE ID:", deviceId, typeof deviceId);

    const res = await fetch(`${CAPTION_URL}/generate-captions`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "x-device-id": deviceId,
      },
      body: formData,
    });

    return await res.json();
  } catch {
    return { message: "Cannot connect to server" };
  }
};


// ========== GOOGLE LOGIN ==========
export const googleAuth = async (idToken) => {
  try {
    const deviceId = await getOrCreateDeviceId();

    const res = await fetch(`${AUTH_URL}/google-signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-device-id": deviceId,
      },
      body: JSON.stringify({ idToken }),
    });

    return await res.json();
  } catch {
    return { message: "Server error" };
  }
};



// =================================================================================
//                          SUBSCRIPTION API FUNCTIONS 
// =================================================================================

// ========== 1. Check Subscription Status ==========
export const getSubscriptionStatus = async () => {
  try {
    const token = await AsyncStorage.getItem("token");

    const res = await fetch(`${SUB_URL}/status`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return await res.json();
  } catch {
    return { message: "Cannot connect to server" };
  }
};

// ========== 2. Start Free Trial ==========
export const startFreeTrial = async (productId) => {
  try {
    const token = await AsyncStorage.getItem("token");

    const res = await fetch(`${SUB_URL}/start-plan-trial`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId }),
    });

    return await res.json();
  } catch {
    return { message: "Cannot connect to server" };
  }
};

// ========== 3. Verify Purchase (Google Play) ==========
export const verifyPurchase = async ({ productId, expiryDate }) => {
  try {
    const token = await AsyncStorage.getItem("token");

    const res = await fetch(`${SUB_URL}/verify`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId, expiryDate }),
    });

    return await res.json();
  } catch {
    return { message: "Cannot connect to server" };
  }
};
