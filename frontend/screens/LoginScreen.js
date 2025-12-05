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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginUser, googleLogin } from "../api/api";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";

const LoginScreen = () => {
  const navigation = useNavigation();

  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.GOOGLE_CLIENT_ID,
    });
  }, []);

  const handleLogin = async () => {
    setErrorMessage("");
    setLoading(true);

    if (!email || !password) {
      setErrorMessage("All fields are required !");
      setLoading(false);
      return;
    }

    try {
      const data = await loginUser({ email, password });

      if (data.token) {
        await AsyncStorage.setItem("token", data.token);
        await AsyncStorage.setItem("user", JSON.stringify(data.user));

        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
      } else {
        setErrorMessage(data.message || "Invalid login credentials");
      }
    } catch (error) {
      setErrorMessage("Cannot connect to server");
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      setErrorMessage("");

      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      const res = await googleLogin(userInfo.idToken);

      if (res.token) {
        await AsyncStorage.setItem("token", res.token);
        await AsyncStorage.setItem("user", JSON.stringify(res.user));

        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
      } else {
        setErrorMessage("Google login failed");
      }
    } catch (error) {
      console.log("Google login error:", error);
      if (error?.code !== statusCodes.SIGN_IN_CANCELLED) {
        setErrorMessage("Google login failed");
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

      {/* Background Decorations */}
      <View style={styles.bgTop} pointerEvents="none" />
      <View style={styles.bgBottom} pointerEvents="none" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.centerWrapper}>
          <Text style={styles.topText}>Welcome Back!</Text>

          <View style={styles.box}>
            {/* EMAIL */}
            <View style={styles.inputRow}>
              <Ionicons
                name="mail-outline"
                size={18}
                color="#8a8a8d"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Enter your email"
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
              <Pressable onPress={() => setShowPass(!showPass)} style={styles.eye}>
                <Ionicons
                  name={showPass ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#b5b5b5"
                />
              </Pressable>
            </View>

            <Pressable onPress={() => navigation.navigate("ForgotPasswordScreen")}>
              <Text style={styles.forgot}>Forgot Password?</Text>
            </Pressable>

            {errorMessage ? <Text style={styles.errorMsg}>{errorMessage}</Text> : null}

            {/* LOGIN BUTTON */}
            <Pressable
              onPress={handleLogin}
              disabled={loading}
              style={({ pressed }) => [
                styles.button,
                pressed && !loading && { transform: [{ scale: 0.96 }] },
              ]}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </Pressable>

            {/* OR DIVIDER */}
            <Text style={styles.or}>──────── OR ────────</Text>

            {/* GOOGLE LOGIN */}
            <Pressable
              onPress={handleGoogleLogin}
              style={({ pressed }) => [
                styles.googleButton,
                pressed && !googleLoading && { transform: [{ scale: 0.96 }], opacity: 0.9 }
              ]}
            >
              {googleLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="logo-google" size={20} color="white" />
                  <Text style={styles.googleText}>Continue with Google</Text>
                </>
              )}
            </Pressable>

            <Pressable onPress={() => navigation.navigate("Register")}>
              <Text style={styles.registerText}>
                Don’t have an account?{" "}
                <Text style={styles.registerLink}>Register</Text>
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a1822ff" },
  header: { flexDirection: "row", paddingVertical: 10, paddingHorizontal: 5 },
  backButton: { flexDirection: "row", alignItems: "center" },
  headerTitleb: { color: "#7c7a7aff", marginLeft: 1, fontSize: 15, fontWeight: "400" },
  centerWrapper: { flex: 1, justifyContent: "center", },
  topText: {
    color: "#dbd8d8ff",
    fontSize: 30,
    fontWeight: "600",
    alignSelf: "center",
    marginBottom: 30,
  },
  box: {paddingHorizontal: 20, marginHorizontal: 16,marginBottom: 20 },
  inputRow: {
    flexDirection: "row",
    backgroundColor: "#1F1D29",
    borderRadius: 10,
    paddingHorizontal: 12,
    alignItems: "center",
    marginBottom: 15,
  },
  passwordRow2: {
    flexDirection: "row",
    backgroundColor: "#1F1D29",
    borderRadius: 10,
    paddingHorizontal: 12,
    alignItems: "center",
    marginBottom: 15,
  },
  inputIcon: { marginRight: 10 },
  inputField: { flex: 1, color: "white", fontSize: 16, paddingVertical: 14 },
  eye: { paddingLeft: 10 },
  forgot: { color: "#7da8ff", marginBottom: 20, fontSize: 14 },
  button: {
    backgroundColor: "#7d5df8",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 0,
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
  errorMsg: { color: "#ff6b6b", textAlign: "center", marginBottom: 10 },
  or: { color: "#808080", textAlign: "center", marginVertical: 20 },
  googleButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4285F4",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#5A8FF0",
    gap: 10,
    marginBottom: 20,
  },
  googleText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
  registerText: { color: "#b5b5b5", textAlign: "center", marginTop: 10, fontSize: 15 },
  registerLink: { color: "#7da8ff", fontWeight: "600" },

  bgTop: {
    position: "absolute",
    top: -90,
    right: -90,
    width: 260,
    height: 260,
    backgroundColor: "#35323fff",
    borderRadius: 200,
    opacity: 0.35,
  },
  bgBottom: {
    position: "absolute",
    bottom: -140,
    left: -140,
    width: 300,
    height: 300,
    backgroundColor: "#35323fff",
    borderRadius: 200,
    opacity: 0.3,
  },

});
