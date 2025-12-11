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
  Image,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerUser, googleAuth  } from "../api/api";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";

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
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: "537694548839-kl9qrfghurm92ndd6adoefjp200512d2.apps.googleusercontent.com",
      offlineAccess: true
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

  // const handleRegister = async () => {
  //   setErrorMessage("");
  //   setLoading(true);

  //   if (!name || !email || !password || !confirmPassword) {
  //     setErrorMessage("All fields are required !");
  //     setLoading(false);
  //     return;
  //   }

  //   if (!passwordRule.test(password)) {
  //     setErrorMessage("Password must follow requirements");
  //     setLoading(false);
  //     return;
  //   }

  //   if (password !== confirmPassword) {
  //     setErrorMessage("Passwords do not match");
  //     setLoading(false);
  //     return;
  //   }

  //   try {
  //     const data = await registerUser({ name, email, password });

  //     if (data?.message?.toLowerCase().includes("otp")) {
  //       setLoading(false);
  //       navigation.navigate("OtpScreen", { email });
  //       return;
  //     }

  //     setErrorMessage(data?.message || "Registration failed");
  //   } catch {
  //     setErrorMessage("Cannot connect to server");
  //   }

  //   setLoading(false);
  // };

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

    setErrorMessage(data?.message || "Registration failed");
  } catch {
    setErrorMessage("Cannot connect to server");
  }

  setLoading(false);
};


 const handleGoogleSignup = async () => {
  try {
    setErrorMessage("");
    setGoogleLoading(true);

    await GoogleSignin.hasPlayServices();

    await GoogleSignin.signOut();

    const userInfo = await GoogleSignin.signIn();

    const idToken = userInfo?.data?.idToken;

    if (!idToken) {
      setErrorMessage("Google Signup Failed");
      return;
    }

    const res = await googleAuth(idToken);

    if (res.success && res.token) {
      await AsyncStorage.setItem("token", res.token);
      await AsyncStorage.setItem("user", JSON.stringify(res.user));

      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    } else {
      setErrorMessage(res.message || "Google Signup Failed");
    }

  } catch (error) {
    if (error?.code !== statusCodes.SIGN_IN_CANCELLED) {
      setErrorMessage("Google Login Failed. Try again.");
    }
  }

  setGoogleLoading(false);
};

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#7c7a7aff" />
          <Text style={styles.headerTitleb}>Back</Text>
        </Pressable>
      </View>

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

            {/* REQUIREMENTS */}
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

            {/* ERROR */}
            {errorMessage ? <Text style={styles.errorMsg}>{errorMessage}</Text> : null}

            {/* CREATE ACCOUNT */}
            <Pressable
              onPress={handleRegister}
              disabled={loading}
              style={({ pressed }) => [
                styles.button,
                pressed && !loading && { transform: [{ scale: 0.96 }] },
              ]}
            >
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Create Account</Text>}
            </Pressable>

            {/* OR DIVIDER */}
            <Text style={styles.or}>──────── OR ────────</Text>

            {/* GOOGLE BUTTON */}
            <Pressable
              onPress={handleGoogleSignup}
              disabled={googleLoading}
              style={({ pressed }) => [
                styles.googleButton,
                pressed && !googleLoading && { transform: [{ scale: 0.96 }], opacity: 0.9 },
              ]}
            >
              {googleLoading ? (
                <ActivityIndicator color="black" />
              ) : (
                <>
                  <Image
                    source={require("../src/images/google.png")}
                    style={{ width: 22, height: 22 }}
                  />
                  <Text style={styles.googleText}>Continue with Google</Text>
                </>
              )}
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
  header: { flexDirection: "coloum", alignItems: "left", paddingVertical: 10, paddingHorizontal: 5 },
  backButton: { flexDirection: "row", alignItems: "center" },
  headerTitleb: { color: "#7c7a7aff", marginLeft: 1, fontSize: 15, fontWeight: "400" },
  centerWrapper: { flex: 1, justifyContent: "center", paddingBottom: 50 },
  topText: { color: "#dbd8d8ff", fontSize: 30, fontWeight: "600", alignSelf: "center", marginBottom: 30 },
  box: { padding: 20, marginHorizontal: 16, paddingTop: 0, paddingBottom: 0 },
  label: { color: "#8a8a8d", fontSize: 14, marginBottom: 6, marginTop: 10 },
  inputRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#1F1D29", borderRadius: 10, paddingHorizontal: 12, marginBottom: 10 },
  passwordRow2: { flexDirection: "row", alignItems: "center", backgroundColor: "#1F1D29", borderRadius: 10, paddingHorizontal: 12, marginBottom: 10 },
  inputIcon: { marginRight: 10 },
  inputField: { flex: 1, color: "white", fontSize: 16, paddingVertical: 14 },
  eye: { paddingLeft: 10 },
  strengthInline: { fontSize: 12, marginRight: 8 },
  dropdownHeader: { flexDirection: "row", alignItems: "center", marginBottom: 5, justifyContent: "flex-end" },
  dropdownText: { color: "#7da8ff", fontSize: 15, marginRight: 5 },
  requireBox: { backgroundColor: "#1F1D29", borderRadius: 10, padding: 12, marginBottom: 10 },
  reqItem: { color: "#dbd8d8ff", fontSize: 14, marginBottom: 6 },
  button: { backgroundColor: "#7d5df8", paddingVertical: 15, borderRadius: 12, alignItems: "center", marginTop: 10, marginBottom: 0 },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
  errorMsg: { color: "#ff6b6b", textAlign: "center", marginBottom: 0, fontSize: 14, fontWeight: "500" },
  loginText: { color: "#b5b5b5", textAlign: "center", marginTop: 0, fontSize: 15 },
  loginLink: { color: "#7da8ff", fontWeight: "600" },
  or: { color: "#808080", marginVertical: 20, textAlign: "center" },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    paddingVertical: 14,
    borderRadius: 12,
    width: "100%",
    marginTop: -5,
    marginBottom: 20,
    borderWidth: 1,
    gap: 20,
  },
  googleText: { color: "wblackhite", fontSize: 15, fontWeight: "600" },
  bgTop: { position: "absolute", top: -135, right: -135, width: 260, height: 260, backgroundColor: "#35323fff", borderRadius: 200, opacity: 0.35 },
  bgBottom: { position: "absolute", bottom: -160, left: -160, width: 300, height: 300, backgroundColor: "#35323fff", borderRadius: 200, opacity: 0.3 },
});
