import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { registerUser } from "../api/api";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";

const BASE_URL = "https://ai-captions.onrender.com/api/auth";

const RegisterScreen = () => {
  const navigation = useNavigation();
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  //  Configure Google Sign-In 
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.GOOGLE_CLIENT_ID,
    });
  }, []);

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
    } catch {
      setErrorMessage("Cannot connect to server");
    }

    setLoading(false);
  };

  const handleGoogleSignup = async () => {
    try {
      setErrorMessage("");
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const userInfo = await GoogleSignin.signIn();

      console.log("Google user:", userInfo);
      // Here later you can call your backend to create/login the user with Google data

    } catch (error) {
      console.log("Google sign-in error:", error);
      if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled — do nothing
      } else {
        setErrorMessage("Google sign-in failed");
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#7c7a7aff" />
          <Text style={styles.headerTitleb}>Back</Text>
        </Pressable>
      </View>

      {/* Background Decorations */}
      <View style={styles.bgTop} pointerEvents="none" />
      <View style={styles.bgBottom} pointerEvents="none" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.centerWrapper}>
          <Text style={styles.topText}>Create Account!</Text>

          <View style={styles.box}>
            {/* NAME */}
            {/* <Text style={styles.label}>Full Name</Text> */}
            <View style={styles.inputRow}>
              <Ionicons
                name="person-outline"
                size={18}
                color="#8a8a8d"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Enter your name"
                placeholderTextColor="#8a8a8d"
                style={styles.inputField}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* EMAIL */}
            {/* <Text style={styles.label}>Email</Text> */}
            <View style={styles.inputRow}>
              <Ionicons
                name="mail-outline"
                size={18}
                color="#8a8a8d"
                style={styles.inputIcon}
              />
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
            {/* <Text style={styles.label}>Password</Text> */}
            <View style={styles.passwordRow2}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color="#8a8a8d"
                style={styles.inputIcon}
              />

              <TextInput
                placeholder="Enter password"
                placeholderTextColor="#8a8a8d"
                style={[styles.inputField, { flex: 1 }]}
                secureTextEntry={!showPass}
                value={password}
                onChangeText={setPassword}
              />

              {/* Strength  */}
              {strength !== "" && (
                <Text
                  style={[
                    styles.strengthInline,
                    strength === "Weak"
                      ? { color: "#FF453A" }
                      : strength === "Medium"
                        ? { color: "#FFA500" }
                        : { color: "#32D74B" },
                  ]}
                >
                  {strength}
                </Text>
              )}

              <Pressable
                onPress={() => setShowPass(!showPass)}
                style={styles.eye}
              >
                <Ionicons
                  name={showPass ? "eye-off-outline" : "eye-outline"}
                  size={21}
                  color="#b5b5b5"
                />
              </Pressable>
            </View>

            {/* CONFIRM PASSWORD */}
            {/* <Text style={styles.label}>Confirm Password</Text> */}
            <View style={styles.passwordRow2}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color="#8a8a8d"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Confirm password"
                placeholderTextColor="#8a8a8d"
                style={[styles.inputField, { flex: 1 }]}
                secureTextEntry={!showConfirmPass}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <Pressable
                onPress={() => setShowConfirmPass(!showConfirmPass)}
                style={styles.eye}
              >
                <Ionicons
                  name={showConfirmPass ? "eye-off-outline" : "eye-outline"}
                  size={21}
                  color="#b5b5b5"
                />
              </Pressable>
            </View>

            {/* REQUIREMENTS for PASSWORD */}
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
                <Text
                  style={[
                    styles.reqItem,
                    password.length >= 8 && { color: "#32D74B" },
                  ]}
                >
                  {password.length >= 8 ? "✓" : "✗"} 8+ characters
                </Text>

                <Text
                  style={[
                    styles.reqItem,
                    /[A-Z]/.test(password) && { color: "#32D74B" },
                  ]}
                >
                  {/[A-Z]/.test(password) ? "✓" : "✗"} One uppercase letter
                </Text>

                <Text
                  style={[
                    styles.reqItem,
                    /\d/.test(password) && { color: "#32D74B" },
                  ]}
                >
                  {/\d/.test(password) ? "✓" : "✗"} One number
                </Text>

                <Text
                  style={[
                    styles.reqItem,
                    /[@$!%*?&]/.test(password) && { color: "#32D74B" },
                  ]}
                >
                  {/[@$!%*?&]/.test(password)
                    ? "✓"
                    : "✗"} One special character
                </Text>
              </View>
            )}

            {/* ERROR */}
            {errorMessage ? (
              <Text style={styles.errorMsg}>{errorMessage}</Text>
            ) : null}

            {/* CREATE ACCOUNT BUTTON */}
            <Pressable
              onPress={handleRegister}
              disabled={loading}
              style={({ pressed }) => [
                styles.button,
                pressed && !loading && { transform: [{ scale: 0.96 }] },
              ]}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </Pressable>

            {/* OR DIVIDER */}
            <Text style={styles.or}>──────── OR ────────</Text>

            {/* GOOGLE BUTTON WITH PRESS FEEDBACK */}
            <Pressable
              onPress={handleGoogleSignup}
              style={({ pressed }) => [
                styles.googleButton,
                pressed && { transform: [{ scale: 0.96 }], opacity: 0.9 },
              ]}
            >
              <Ionicons name="logo-google" size={20} color="white" />
              <Text style={styles.googleText}>Continue with Google</Text>
            </Pressable>

            {/* LOGIN LINK */}
            <Pressable onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginText}>
                Already have an account?{" "}
                <Text style={styles.loginLink}>Login</Text>
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
  container: { flex: 1, backgroundColor: "#1a1822ff", paddingHorizontal: 0 },
  header: {
    flexDirection: "coloum",
    alignItems: "left",
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  backButton: { flexDirection: "row", alignItems: "center" },
  headerTitleb: {
    color: "#7c7a7aff",
    marginLeft: 1,
    fontSize: 15,
    fontWeight: "400",
  },
  centerWrapper: { flex: 1, justifyContent: "center", paddingBottom: 50 },
  topText: {
    color: "#dbd8d8ff",
    fontSize: 30,
    fontWeight: "600",
    alignSelf: "center",
    marginBottom: 20,
  },
  box: {
    padding: 20,
    marginHorizontal: 16,
    paddingTop:23,
    paddingBottom:25
  },
  label: { color: "#8a8a8d", fontSize: 14, marginBottom: 6, marginTop: 10 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F1D29",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  passwordRow2: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F1D29",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  inputIcon: { marginRight: 10 },
  inputField: { flex: 1, color: "white", fontSize: 16, paddingVertical: 14 },
  eye: { paddingLeft: 10 },
  strengthInline: {
    fontSize: 12,
    marginRight: 8,
  },
  dropdownHeader: { flexDirection: "row", alignItems: "center", marginBottom: 5, justifyContent: "flex-end" },
  dropdownText: { color: "#7da8ff", fontSize: 15, marginRight: 5 },
  requireBox: {
    backgroundColor: "#1F1D29",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  reqItem: { color: "#dbd8d8ff", fontSize: 14, marginBottom: 6 },
  button: {
    backgroundColor: "#7d5df8",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 0,
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
  errorMsg: {
    color: "#ff6b6b",
    textAlign: "center",
    marginBottom: 0,
    fontSize: 14,
    fontWeight: "500",
  },
  loginText: {
    color: "#b5b5b5",
    textAlign: "center",
    marginTop: 10,
    fontSize: 15,
  },
  loginLink: { color: "#7da8ff", fontWeight: "600" },
  or: {
    color: "#808080",
    marginVertical: 20,
    textAlign: "center",

  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4285F4",
    paddingVertical: 14,
    borderRadius: 12,
    width: "100%",
    marginTop: -5,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#5A8FF0",
    gap: 20,
  },
  googleText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
  
  bgTop: {
  position: "absolute",
  top: -135,
  right: -135,
  width: 260,
  height: 260,
  backgroundColor: "#35323fff",
  borderRadius: 200,
  opacity: 0.35,
},
bgBottom: {
  position: "absolute",
  bottom: -160,
  left: -160,
  width: 300,
  height: 300,
  backgroundColor: "#35323fff",
  borderRadius: 200,
  opacity: 0.3,
},
});
