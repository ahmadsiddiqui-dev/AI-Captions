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
  ScrollView, 
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "react-native";
import { loginUser, googleAuth } from "../api/api";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";

const GLASS_BG = "rgba(255,255,255,0.08)";
const GLASS_BORDER = "rgba(255,255,255,0.15)";
const GLASS_TEXT = "#E5E5EA";
const GLASS_SUBTEXT = "#A1A1A6";
const ACCENT = "#F5C77A";

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
      webClientId: "537694548839-kl9qrfghurm92ndd6adoefjp200512d2.apps.googleusercontent.com",
      offlineAccess: true
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
    } catch {
      setErrorMessage("Cannot connect to server");
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    try {
      setErrorMessage(""); 
      setGoogleLoading(true);

      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signOut();

      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo?.data?.idToken;

      if (!idToken) {
        setErrorMessage("Google Login Failed. Try again.");
        setGoogleLoading(false);
        return;
      }

      const res = await googleAuth(idToken);

      if (res.success) {
        await AsyncStorage.setItem("token", res.token);
        await AsyncStorage.setItem("user", JSON.stringify(res.user));

        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
      } else {
        setErrorMessage(res.message || "Google Login Failed");
      }

    } catch {
      setErrorMessage("Google Login Failed. Try again.");
    }

    setGoogleLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }} 
      >

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
            <Text style={styles.topText}>Welcome Back!</Text>

            <View style={styles.box}>
              {/* EMAIL */}
              <View style={styles.inputRow}>
                <Ionicons name="mail-outline" size={18} color="#A1A1A6" style={styles.inputIcon} />
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
                <Ionicons name="lock-closed-outline" size={18} color="#A1A1A6" style={styles.inputIcon} />
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

              <Pressable
                onPress={handleLogin}
                disabled={loading}
                style={({ pressed }) => [
                  styles.button,
                  pressed && !loading && { transform: [{ scale: 0.96 }] },
                ]}
              >
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Login</Text>}
              </Pressable>

              <Text style={styles.or}>──────── OR ────────</Text>

              <Pressable
                onPress={handleGoogleLogin}
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
                      style={{ width: 20, height: 20, marginRight: 10 }}
                      resizeMode="contain"
                    />
                    <Text style={styles.googleText}>Continue with Google</Text>
                  </>
                )}
              </Pressable>

              <Pressable onPress={() => navigation.replace("Register")}>
                <Text style={styles.registerText}>
                  Don’t have an account? <Text style={styles.registerLink}>Register</Text>
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>

      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#141414ff" },
  header: { flexDirection: "row", paddingVertical: 10, paddingHorizontal: 5 },
  backButton: { flexDirection: "row", alignItems: "center" },
  headerTitleb: { color: "#7c7a7aff", marginLeft: 1, fontSize: 15, fontWeight: "400" },
  centerWrapper: { flex: 1, justifyContent: "center" },
  topText: {
    color: "#dbd8d8ff",
    fontSize: 30,
    fontWeight: "600",
    alignSelf: "center",
    marginBottom: 30,
  },
  box: { paddingHorizontal: 20, marginHorizontal: 16, marginBottom: 20 },
inputRow: {
  flexDirection: "row",
  backgroundColor: GLASS_BG,
  borderRadius: 12,
  paddingHorizontal: 14,
  alignItems: "center",
  marginBottom: 15,
  borderWidth: 1,
  borderColor: GLASS_BORDER,
},

passwordRow2: {
  flexDirection: "row",
  backgroundColor: GLASS_BG,
  borderRadius: 12,
  paddingHorizontal: 14,
  alignItems: "center",
  marginBottom: 15,
  borderWidth: 1,
  borderColor: GLASS_BORDER,
},

  inputIcon: { marginRight: 10 },
  inputField: {
  flex: 1,
  color: GLASS_TEXT,
  fontSize: 16,
  paddingVertical: 14,
},

  eye: { paddingLeft: 10 },
  forgot: { color: GLASS_SUBTEXT, marginBottom: 10, fontSize: 14 },
  button: {
  backgroundColor: GLASS_BG,
  paddingVertical: 15,
  borderRadius: 14,
  alignItems: "center",
  borderWidth: 1,
  borderColor: GLASS_BORDER,
},

buttonText: {
  color: ACCENT,
  fontSize: 16,
  fontWeight: "600",
},

  errorMsg: { color: ACCENT, textAlign: "center", marginBottom: 10 },
  or: { color: "#808080", textAlign: "center", marginVertical: 20 },
  googleButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: GLASS_BG,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    marginBottom: 20,
    borderWidth: 1,
  borderColor: GLASS_BORDER,
  },
  googleText: {
    color: GLASS_TEXT,
    fontSize: 15,
    fontWeight: "600",
  },
  registerText: { color: GLASS_SUBTEXT, textAlign: "center", marginTop: 0, fontSize: 15 },
  registerLink: { color: ACCENT, fontWeight: "600" },

  bgTop: {
    position: "absolute",
    top: -90,
    right: -90,
    width: 260,
    height: 260,
    backgroundColor: "rgba(245,199,122,0.08)",
    borderRadius: 200,
    opacity: 0.35,
    borderWidth: 2,
  borderColor: GLASS_BORDER,
  },
  bgBottom: {
    position: "absolute",
    bottom: -140,
    left: -140,
    width: 300,
    height: 300,
    backgroundColor: "rgba(245,199,122,0.08)",
    borderRadius: 200,
    opacity: 0.35,
    borderWidth: 2,
  borderColor: GLASS_BORDER,
  },
});
