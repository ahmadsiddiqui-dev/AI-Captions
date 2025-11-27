import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { registerUser } from "../api/api";

const BASE_URL = "https://ai-captions.onrender.com/api/auth";

const RegisterScreen = () => {
  const navigation = useNavigation();
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [showRequirements, setShowRequirements] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Error & loading
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Password rule
  const passwordRule =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const getStrength = () => {
    if (!password) return "";
    if (password.length < 6) return "Weak";
    if (passwordRule.test(password)) return "Strong";
    return "Medium";
  };
  const strength = getStrength();

const handleRegister = async () => {
  setErrorMessage("");
  setLoading(true);

  if (!name || !email || !password || !confirmPassword) {
    setErrorMessage("All fields are required !");
    setLoading(false);
    return;
  }

  if (!passwordRule.test(password)) {
    setErrorMessage("Password must follow requirements");
    setLoading(false);
    return;
  }

  if (password !== confirmPassword) {
    setErrorMessage("Passwords do not match");
    setLoading(false);
    return;
  }

  try {
    const data = await registerUser({ name, email, password });

    if (data?.message?.toLowerCase().includes("otp")) {
      setLoading(false);
      navigation.navigate("OtpScreen", { email });
      return;
    }

    setErrorMessage(data?.message || "Registration failed");

  } catch (err) {
    setErrorMessage("Cannot connect to server");
  }

  setLoading(false);
};


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={26} color="white" />
        </Pressable>
        <Text style={styles.headerTitle}>Register</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.centerWrapper}>
          <Text style={styles.topText}>Create your account!</Text>

          <View style={styles.box}>
            {/* NAME */}
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputRow}>
              <Ionicons name="person-outline" size={18} color="#8a8a8d" style={styles.inputIcon} />
              <TextInput
                placeholder="Enter your name"
                placeholderTextColor="#8a8a8d"
                style={styles.inputField}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* EMAIL */}
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputRow}>
              <Ionicons name="mail-outline" size={18} color="#8a8a8d" style={styles.inputIcon} />
              <TextInput
                placeholder="Enter email"
                placeholderTextColor="#8a8a8d"
                style={styles.inputField}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* PASSWORD */}
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordRow2}>
              <Ionicons name="lock-closed-outline" size={18} color="#8a8a8d" style={styles.inputIcon} />
              <TextInput
                placeholder="Enter password"
                placeholderTextColor="#8a8a8d"
                style={[styles.inputField, { flex: 1 }]}
                secureTextEntry={!showPass}
                value={password}
                onChangeText={setPassword}
              />
              <Pressable onPress={() => setShowPass(!showPass)} style={styles.eye}>
                <Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={21} color="#b5b5b5" />
              </Pressable>
            </View>

            {/* PASSWORD STRENGTH */}
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

            {/* REQUIREMENTS DROPDOWN */}
            <Pressable
              onPress={() => setShowRequirements(!showRequirements)}
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
                <Text style={[styles.reqItem, password.length >= 8 && { color: "#32D74B" }]}>
                  {password.length >= 8 ? "✓" : "✗"} 8+ characters
                </Text>
                <Text style={[styles.reqItem, /[A-Z]/.test(password) && { color: "#32D74B" }]}>
                  {/[A-Z]/.test(password) ? "✓" : "✗"} One uppercase letter
                </Text>
                <Text style={[styles.reqItem, /\d/.test(password) && { color: "#32D74B" }]}>
                  {/\d/.test(password) ? "✓" : "✗"} One number
                </Text>
                <Text style={[styles.reqItem, /[@$!%*?&]/.test(password) && { color: "#32D74B" }]}>
                  {/[@$!%*?&]/.test(password) ? "✓" : "✗"} One special character
                </Text>
              </View>
            )}

            {/* CONFIRM PASSWORD */}
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordRow2}>
              <Ionicons name="lock-closed-outline" size={18} color="#8a8a8d" style={styles.inputIcon} />
              <TextInput
                placeholder="Confirm password"
                placeholderTextColor="#8a8a8d"
                style={[styles.inputField, { flex: 1 }]}
                secureTextEntry={!showConfirmPass}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <Pressable onPress={() => setShowConfirmPass(!showConfirmPass)} style={styles.eye}>
                <Ionicons name={showConfirmPass ? "eye-off-outline" : "eye-outline"} size={21} color="#b5b5b5" />
              </Pressable>
            </View>

            {/* ERROR */}
            {errorMessage ? <Text style={styles.errorMsg}>{errorMessage}</Text> : null}

            {/* CREATE ACCOUNT */}
            <Pressable style={styles.button} onPress={handleRegister} disabled={loading}>
              <Text style={styles.buttonText}>
                {loading ? "Please wait..." : "Create Account"}
              </Text>
            </Pressable>

            {/* LOGIN LINK */}
            <Pressable onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginText}>
                Already have an account? <Text style={styles.loginLink}>Login</Text>
              </Text>
            </Pressable>

          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", paddingHorizontal: 16 },
  header: { flexDirection: "row", alignItems: "center", paddingVertical: 15 },
  backButton: { padding: 5, marginRight: 5 },
  headerTitle: { fontSize: 22, fontWeight: "600", color: "white" },
  centerWrapper: { flex: 1, justifyContent: "center", paddingBottom: 50 },
  topText: { color: "white", fontSize: 22, fontWeight: "600", alignSelf: "center", marginBottom: 25 },
  box: { backgroundColor: "#1c1c1e", borderRadius: 18, padding: 20 },
  label: { color: "#8a8a8d", fontSize: 14, marginBottom: 6, marginTop: 10 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2c2c2e",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  passwordRow2: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2c2c2e",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  inputIcon: { marginRight: 10 },
  inputField: { flex: 1, color: "white", fontSize: 16, paddingVertical: 14 },
  eye: { paddingLeft: 10 },
  strength: { fontSize: 14, marginBottom: 10 },
  dropdownHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  dropdownText: { color: "#7da8ff", fontSize: 15, marginRight: 5 },
  requireBox: { backgroundColor: "#1c1c1e", borderRadius: 10, padding: 12, marginBottom: 15 },
  reqItem: { color: "white", fontSize: 14, marginBottom: 6 },
  button: { backgroundColor: "#7d5df8", paddingVertical: 15, borderRadius: 12, alignItems: "center", marginTop: 10, marginBottom: 20 },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
  errorMsg: { color: "#ff6b6b", textAlign: "center", marginBottom: 10, fontSize: 14, fontWeight: "500" },
  loginText: { color: "#b5b5b5", textAlign: "center", marginTop: 10, fontSize: 15 },
  loginLink: { color: "#7da8ff", fontWeight: "600" },
});
