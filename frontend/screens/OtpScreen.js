import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { verifyOtp, resendOtp } from "../api/api";

const OtpScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const email = route.params?.email;
  const insets = useSafeAreaInsets();

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
      <View style={styles.container}>

        <Pressable
          onPress={() => navigation.goBack()}
          style={[styles.closeBtn, { top: insets.top + 5 }]}
        >
          <Ionicons name="close" size={28} color="white" />
        </Pressable>

        <Text style={styles.title}>Enter OTP sent to {email}</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter OTP"
          placeholderTextColor="#808080"
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

        <Pressable style={styles.button} onPress={handleVerify}>
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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#000" },

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#000",
  },

  closeBtn: {
    position: "absolute",
    right: 20,
    padding: 5,
  },

  title: {
    color: "white",
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

  success: { color: "#32D74B" },
  error: { color: "#FF453A" },

  input: {
    backgroundColor: "#2c2c2e",
    color: "white",
    width: "80%",
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
    textAlign: "center",
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

  resend: {
    color: "#7da8ff",
    marginTop: 15,
    fontSize: 14,
  },
});
