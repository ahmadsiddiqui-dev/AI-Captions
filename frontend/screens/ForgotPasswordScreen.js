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
      <View style={styles.container}>

        <Pressable onPress={() => navigation.goBack()} style={[styles.closeBtn, { top: insets.top + 5 }]}>
          <Ionicons name="close" size={26} color="white" />
        </Pressable>

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

        <Pressable style={styles.button} onPress={handleSendOtp}>
          <Text style={styles.buttonText}>Send OTP</Text>
        </Pressable>

      </View>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;

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
  },

  success: { color: "#32D74B" },
  error: { color: "#FF453A" },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2c2c2e",
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
});
