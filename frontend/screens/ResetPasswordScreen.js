import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  ScrollView
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { resetPassword, resendOtp } from "../api/api";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ResetPasswordScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const email = route.params?.email;

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const [showRequirements, setShowRequirements] = useState(false);

  const [timer, setTimer] = useState(20);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const passwordRule =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const getStrength = () => {
    if (newPassword.length === 0) return "";
    if (newPassword.length < 6) return "Weak";
    if (passwordRule.test(newPassword)) return "Strong";
    return "Medium";
  };

  const strength = getStrength();

  const handleReset = async () => {
    setMessage("");

    if (!otp.trim()) {
      setSuccess(false);
      setMessage("OTP is required");
      return;
    }
    if (!/^\d{6}$/.test(otp)) {
      setSuccess(false);
      setMessage("Enter a valid OTP");
      return;
    }
    if (!newPassword.trim()) {
      setSuccess(false);
      setMessage("Password is required");
      return;
    }
    if (!passwordRule.test(newPassword)) {
      setSuccess(false);
      setMessage("Password must follow requirements");
      return;
    }

    const tempCheck = await resetPassword({ email, otp, newPassword });

    if (
      tempCheck?.message === "New password cannot be same as old password" ||
      tempCheck?.message === "Invalid email format" ||
      tempCheck?.message === "Invalid or expired OTP" ||
      tempCheck?.message === "Password must follow requirements." ||
      tempCheck?.error
    ) {
      setSuccess(false);
      setMessage(tempCheck.message || "Failed to reset password");
      return;
    }

    if (tempCheck?.message === "Password reset successful!") {
      setSuccess(true);
      setMessage(tempCheck.message);

      setTimeout(() => {
        navigation.navigate("Login");
      }, 1000);
      return;
    }

    setSuccess(false);
    setMessage("Something went wrong");
  };

  const handleResend = async () => {
    if (!canResend) return;

    const res = await resendOtp({ email });
    setSuccess(true);
    setMessage(res.message || "OTP resent");
    setTimer(20);
    setCanResend(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>

        <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1 }}
             showsVerticalScrollIndicator={false} 
          >

         
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#7c7a7aff" />
          <Text style={styles.headerTitleb}>Back</Text>
        </Pressable>
      </View>
      <View style={styles.container}>

        {/* Background Decorations */}
        <View style={styles.bgTop} pointerEvents="none" />
        <View style={styles.bgBottom} pointerEvents="none" />

        <Text style={styles.title}>Reset Password for {email}</Text>

        <View style={styles.inputRow}>
          <Ionicons name="key-outline" size={18} color="#808080" style={styles.icon} />
          <TextInput
            style={[styles.inputField, { flex: 1 }]}
            placeholder="Enter OTP"
            placeholderTextColor="#808080"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
          />

          <Pressable
            onPress={handleResend}
            disabled={!canResend}
            style={{ opacity: canResend ? 1 : 0.4, paddingLeft: 8 }}
          >
            <Ionicons
              name="refresh-outline"
              size={22}
              color={canResend ? "#7da8ff" : "#555"}
            />
            {!canResend && (
              <Text style={{ color: "#777", fontSize: 11, textAlign: "center" }}>
                {timer}s
              </Text>
            )}
          </Pressable>
        </View>

        <View style={styles.inputRow}>
          <Ionicons name="lock-closed-outline" size={18} color="#808080" style={styles.icon} />

          <TextInput
            style={[styles.inputField, { flex: 1 }]}
            placeholder="New Password"
            placeholderTextColor="#808080"
            secureTextEntry={!showPass}
            value={newPassword}
            onChangeText={setNewPassword}
          />

          <Pressable onPress={() => setShowPass(!showPass)} style={styles.eye}>
            <Ionicons
              name={showPass ? "eye-off-outline" : "eye-outline"}
              size={21}
              color="#b5b5b5"
            />
          </Pressable>
        </View>

        {strength !== "" && (
          <Text
            style={[
              styles.strength,
              strength === "Weak"
                ? { color: "#FF453A" }
                : strength === "Medium"
                  ? { color: "#FFA500" }
                  : { color: "#32D74B" },
            ]}
          >
            Strength: {strength}
          </Text>
        )}

        <Pressable
          onPress={() => {
            LayoutAnimation.easeInEaseOut();
            setShowRequirements(!showRequirements);
          }}
          style={styles.dropdownHeader}
        >
          <Text style={styles.dropdownText}>
            {showRequirements ? "Hide Requirements" : "Show Requirements"}
          </Text>
          <Ionicons
            name={showRequirements ? "chevron-up" : "chevron-down"}
            size={20}
            color="#7da8ff"
          />
        </Pressable>

        {showRequirements && (
          <View style={styles.requireBox}>
            <Text style={[styles.reqItem, newPassword.length >= 8 && { color: "#32D74B" }]}>
              {newPassword.length >= 8 ? "✓" : "✗"} 8+ characters
            </Text>
            <Text style={[styles.reqItem, /[A-Z]/.test(newPassword) && { color: "#32D74B" }]}>
              {/[A-Z]/.test(newPassword) ? "✓" : "✗"} One uppercase letter
            </Text>
            <Text style={[styles.reqItem, /\d/.test(newPassword) && { color: "#32D74B" }]}>
              {/\d/.test(newPassword) ? "✓" : "✗"} One number
            </Text>
            <Text style={[styles.reqItem, /[@$!%*?&]/.test(newPassword) && { color: "#32D74B" }]}>
              {/[@$!%*?&]/.test(newPassword) ? "✓" : "✗"} One special character
            </Text>
          </View>
        )}

        {message.length > 0 && (
          <Text style={[styles.msg, success ? styles.success : styles.error]}>
            {message}
          </Text>
        )}

        <Pressable
          onPress={handleReset}
          style={({ pressed }) => [
            styles.button,
            { transform: [{ scale: pressed ? 0.96 : 1 }] },
            pressed && { opacity: 0.8 }
          ]}
        >
          <Text style={styles.buttonText}>Reset Password</Text>
        </Pressable>

      </View>
       </ScrollView>
    </SafeAreaView>
  );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#1a1822ff" },

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#1a1822ff",
  },

  header: { flexDirection: "coloum", alignItems: "left", paddingVertical: 10, paddingHorizontal: 5, },
  backButton: { flexDirection: "row", alignItems: "center" },
  headerTitle: { fontSize: 28, fontWeight: "bold", color: "#dbd8d8ff", marginTop: 14, paddingHorizontal: 14, },
  headerTitleb: { color: "#7c7a7aff", marginLeft: 1, fontSize: 15, fontWeight: "400" },

  title: {
    color: "#dbd8d8ff",
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },

  msg: {
    fontSize: 15,
    marginBottom: 20,
    fontWeight: "500",
    textAlign: "center",
  },
  success: { color: "#32D74B" },
  error: { color: "#FF453A" },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F1D29",
    width: "80%",
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 20,
  },

  icon: {
    marginRight: 10,
  },

  inputField: {
    flex: 1,
    color: "white",
    fontSize: 16,
    paddingVertical: 14,
  },

  eye: { paddingLeft: 10 },

  strength: {
    fontSize: 14,
    marginBottom: 10,
  },

  dropdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  dropdownText: {
    color: "#7da8ff",
    fontSize: 15,
    marginRight: 5,
  },

  requireBox: {
    width: "80%",
    backgroundColor: "#222224ff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },

  reqItem: {
    color: "#dbd8d8ff",
    marginBottom: 6,
    fontSize: 14,
  },

  button: {
    backgroundColor: "#7d5df8",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  bgTop: {
    position: "absolute",
    top: -130,
    right: -110,
    width: 260,
    height: 260,
    backgroundColor: "#35323fff",
    borderRadius: 200,
    opacity: 0.35,
  },
  bgBottom: {
    position: "absolute",
    bottom: -120,
    left: -120,
    width: 300,
    height: 300,
    backgroundColor: "#35323fff",
    borderRadius: 200,
    opacity: 0.3,
  },
});
