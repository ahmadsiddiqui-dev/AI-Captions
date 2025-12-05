import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { forgotPassword } from "../api/api";

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSendOtp = async () => {
    setMessage("");

    if (!email.trim()) {
      setSuccess(false);
      setMessage("Email is required");
      return;
    }

    const res = await forgotPassword({ email });

    console.log("Forgot Password Response:", res);

    if (!res?.success) {
      setSuccess(false);
      setMessage(res?.message || "Something went wrong!");
      return;
    }

    setSuccess(true);
    setMessage(res.message);

    setTimeout(() => {
      navigation.navigate("ResetPasswordScreen", { email });
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
        <Text style={styles.title}>Enter your email to reset password</Text>

        <View style={styles.inputRow}>
          <Ionicons name="mail-outline" size={18} color="#808080" style={styles.icon} />
          <TextInput
            style={styles.inputField}
            placeholder="Email"
            placeholderTextColor="#808080"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {message.length > 0 && (
          <Text style={[styles.msg, success ? styles.success : styles.error]}>
            {message}
          </Text>
        )}

        <Pressable
          onPress={handleSendOtp}
          style={({ pressed }) => [
            styles.button,
            { transform: [{ scale: pressed ? 0.96 : 1 }] },
            pressed && { opacity: 0.8 }
          ]}
        >
          <Text style={styles.buttonText}>Send OTP</Text>
        </Pressable>


      </View>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;

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
    marginBottom: 15,
    fontSize: 15,
    fontWeight: "500",
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

  icon: { marginRight: 10 },

  inputField: {
    flex: 1,
    color: "white",
    fontSize: 16,
    paddingVertical: 14,
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
