import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { verifyOtp, resendOtp } from "../api/api";
import { useTheme } from "../src/theme/ThemeContext";


const OtpScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const email = route.params?.email;
  const insets = useSafeAreaInsets();
  const { theme, toggleTheme } = useTheme();
  const styles = createStyles(theme);

  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
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

  const handleVerify = async () => {
    setMessage("");

    if (!otp.trim()) {
      setSuccess(false);
      setMessage("OTP is required");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setSuccess(false);
      setMessage("OTP must be 6 digits");
      return;
    }

    const res = await verifyOtp({ email, otp });

    if (res.token) {
      setSuccess(true);
      setMessage("OTP verified successfully!");
      await AsyncStorage.setItem("token", res.token);
      await AsyncStorage.setItem("user", JSON.stringify(res.user));

      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
      }, 800);
    } else {
      setSuccess(false);
      setMessage(res.message || "Invalid OTP");
    }
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
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={theme.ICON} />
          <Text style={styles.headerTitleb}>Back</Text>
        </Pressable>
      </View>
      <View style={styles.container}>

        {/* Background Decorations */}
        <View style={styles.bgTop} pointerEvents="none" />
        <View style={styles.bgBottom} pointerEvents="none" />

        <Text style={styles.title}>Enter OTP sent to {email}</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter OTP"
          placeholderTextColor={theme.ICON}
          keyboardType="number-pad"
          value={otp}
          onChangeText={setOtp}
          maxLength={6}
        />

        {message.length > 0 && (
          <Text style={[styles.msg, success ? styles.success : styles.error]}>
            {message}
          </Text>
        )}

        <Pressable
          onPress={handleVerify}
          style={({ pressed }) => [
            styles.button,
            { transform: [{ scale: pressed ? 0.96 : 1 }] },
            pressed && { opacity: 0.8 }
          ]}
        >
          <Text style={styles.buttonText}>Verify OTP</Text>
        </Pressable>


        <Pressable
          onPress={handleResend}
          disabled={!canResend}
          style={{ opacity: canResend ? 1 : 0.5 }}
        >
          <Text style={styles.resend}>
            {canResend ? "Resend OTP" : `Resend OTP (${timer}s)`}
          </Text>
        </Pressable>

      </View>
    </SafeAreaView>
  );
};

export default OtpScreen;

const createStyles = (theme) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.BG },

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: theme.BG,
  },

  header: { flexDirection: "coloum", alignItems: "left", paddingVertical: 10, paddingHorizontal: 5, },
  backButton: { flexDirection: "row", alignItems: "center" },
  headerTitle: { fontSize: 28, fontWeight: "bold", color: theme.TEXT, marginTop: 14, paddingHorizontal: 14, },
  headerTitleb: { color: theme.SUBTEXT, marginLeft: 1, fontSize: 15, fontWeight: "400" },
  title: {
    color: theme.TEXT,
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },


  msg: {
    marginBottom: 15,
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
  },

  success: { color: theme.ACCENT },
  error: { color: theme.ACCENT },


  input: {
    backgroundColor: theme.CARD_BG,
    color: theme.TEXT,
    width: "80%",
    padding: 12,
    borderRadius: 14,
    marginBottom: 20,
    fontSize: 16,
    textAlign: "center",
    borderWidth: 1,
    borderColor: theme.BORDER,
  },

  button: {
    backgroundColor: theme.CARD_BG,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.BORDER,
  },

  buttonText: {
    color: theme.ACCENT,
    fontSize: 16,
    fontWeight: "600",
  },


  resend: {
    color: theme.SUBTEXT,
    marginTop: 15,
    fontSize: 14,
  },

  bgTop: {
    position: "absolute",
    top: -130,
    right: -110,
    width: 260,
    height: 260,
    backgroundColor: "rgba(245,199,122,0.08)",
    borderRadius: 200,
    opacity: 0.35,
    borderWidth: 2,
    borderColor: theme.BORDER,
  },
  bgBottom: {
    position: "absolute",
    bottom: -120,
    left: -120,
    width: 300,
    height: 300,
    backgroundColor: "rgba(245,199,122,0.08)",
    borderRadius: 200,
    opacity: 0.35,
    borderWidth: 2,
    borderColor: theme.BORDER,
  },
});
