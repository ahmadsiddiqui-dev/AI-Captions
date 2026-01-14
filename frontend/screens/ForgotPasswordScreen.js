import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { forgotPassword } from "../api/api";
import { useTheme } from "../src/theme/ThemeContext";

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme, toggleTheme } = useTheme();
  const styles = createStyles(theme);
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
          <Ionicons name="chevron-back" size={24} color={theme.ICON} />
          <Text style={styles.headerTitleb}>Back</Text>
        </Pressable>
      </View>

      <View style={styles.container}>

        {/* Background Decorations */}
        <View style={styles.bgTop} pointerEvents="none" />
        <View style={styles.bgBottom} pointerEvents="none" />
        <Text style={styles.title}>Enter your email to reset password</Text>

        <View style={styles.inputRow}>
          <Ionicons name="mail-outline" size={18} color={theme.ICON} style={styles.icon} />
          <TextInput
            style={styles.inputField}
            placeholder="Email"
            placeholderTextColor={theme.ICON}
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

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.CARD_BG,
    width: "80%",
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.BORDER,
  },

  inputField: {
    flex: 1,
    color: theme.TEXT,
    fontSize: 16,
    paddingVertical: 12,
  },


  icon: { marginRight: 10 },

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
