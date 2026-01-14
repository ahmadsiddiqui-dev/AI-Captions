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
  ScrollView,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerUser, googleAuth } from "../api/api";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { getOrCreateDeviceId } from "../src/utils/deviceId";
import { useTheme } from "../src/theme/ThemeContext";

const RegisterScreen = () => {
  const navigation = useNavigation();
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const styles = createStyles(theme);

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

  //   if (name.trim().length < 3) {
  //     setErrorMessage("Name must be at least 3 characters long");
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
  //     const deviceId = await getOrCreateDeviceId();

  //     const data = await registerUser(
  //       { name, email, password },
  //       deviceId 
  //     );

  //     if (data?.message?.toLowerCase().includes("successful")) {
  //       await AsyncStorage.setItem("user", JSON.stringify(data.user));
  //       navigation.navigate("Home");
  //       setLoading(false);
  //       return;
  //     }
  //     setErrorMessage(data?.message || "Registration failed");
  //  } catch (err) {
  //   setError(err?.message || "Cannot connect to server");
  // }


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

    if (name.trim().length < 3) {
      setErrorMessage("Name must be at least 3 characters long");
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
      const deviceId = await getOrCreateDeviceId();

      const data = await registerUser(
        { name, email, password },
        deviceId
      );

      if (data?.message?.toLowerCase().includes("successful")) {

        if (data.token) {
          await AsyncStorage.setItem("token", data.token);
        }

        await AsyncStorage.setItem("user", JSON.stringify(data.user));

        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });

        setLoading(false);
        return;
      }

      setErrorMessage(data?.message || "Registration failed");
    } catch (err) {
      setErrorMessage(err?.message || "Cannot connect to server");
    }

    setLoading(false);
  };



  const handleGoogleSignup = async () => {
    try {
      setErrorMessage("");
      setGoogleLoading(true);


      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      try {
        await GoogleSignin.signOut();
      } catch (e) {
      }

      const userInfo = await GoogleSignin.signIn();

      const idToken =
        userInfo?.idToken ||
        userInfo?.user?.idToken ||
        userInfo?.data?.idToken ||
        (userInfo?.authentication && userInfo.authentication.idToken) ||
        null;

      if (!idToken) {
        setErrorMessage("Google Login Failed. Try again.");
        setGoogleLoading(false);
        return;
      }

      const res = await googleAuth(idToken);

      if (res && res.success && res.token) {
        // store token + user
        await AsyncStorage.setItem("token", res.token);
        await AsyncStorage.setItem("user", JSON.stringify(res.user));

        try {
          const subStatus = await getSubscriptionStatus();
          await AsyncStorage.setItem("subscription", JSON.stringify(subStatus));
        } catch (e) {
          console.warn("Failed to fetch subscription status:", e?.message || e);
        }

        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
      } else {
        setErrorMessage(res?.message || "Google Signup Failed");
      }
    } catch (error) {
      if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
        setErrorMessage("");
      } else if (error?.code === statusCodes.IN_PROGRESS) {
        setErrorMessage("Google sign-in already in progress");
      } else if (error?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setErrorMessage("Google Play Services not available or out of date");
      } else {
        setErrorMessage("Google Login Failed. Try again.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };


  return (
    <SafeAreaView style={styles.container}>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={theme.ICON} />
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
                  color={theme.ICON}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Enter your name"
                  placeholderTextColor={theme.ICON}
                  style={styles.inputField}
                  value={name}
                  onChangeText={(text) => {
                    if (text.length <= 20) {
                      setName(text);
                    }
                  }}
                  maxLength={20}
                />

              </View>

              {/* EMAIL */}
              <View style={styles.inputRow}>
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={theme.ICON}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Enter email"
                  placeholderTextColor={theme.ICON}
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
                  color={theme.ICON}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Enter password"
                  placeholderTextColor={theme.ICON}
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
                    color={theme.ICON}
                  />
                </Pressable>
              </View>

              {/* CONFIRM PASSWORD */}
              <View style={styles.passwordRow2}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={theme.ICON}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Confirm password"
                  placeholderTextColor={theme.ICON}
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
                    color={theme.ICON}
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
                  color={theme.ICON}
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
                {loading ? <ActivityIndicator color={theme.ACCENT} /> : <Text style={styles.buttonText}>Create Account</Text>}
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
                  <ActivityIndicator color={theme.ACCENT} />
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
              <Pressable onPress={() => navigation.replace("Login")}>
                <Text style={styles.loginText}>
                  Already have an account?{" "}
                  <Text style={styles.loginLink}>Login</Text>
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>

      </ScrollView>
    </SafeAreaView>
  );
};

export default RegisterScreen;

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.BG, paddingHorizontal: 0 },
  header: { flexDirection: "coloum", alignItems: "left", paddingVertical: 10, paddingHorizontal: 5 },
  backButton: { flexDirection: "row", alignItems: "center" },
  headerTitleb: { color: theme.SUBTEXT, marginLeft: 1, fontSize: 15, fontWeight: "400" },
  centerWrapper: { flex: 1, justifyContent: "center", paddingBottom: 50 },
  // topText: { color: theme.TEXT, fontSize: 30, fontWeight: "600", alignSelf: "center", marginBottom: 30 },
  box: { padding: 20, marginHorizontal: 16, paddingTop: 0, paddingBottom: 0 },
  label: { color: theme.TEXT, fontSize: 14, marginBottom: 6, marginTop: 10 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.CARD_BG,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.BORDER,
  },

  passwordRow2: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.CARD_BG,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.BORDER,
  },

  inputIcon: { marginRight: 10 },
  inputField: {
    flex: 1,
    color: theme.TEXT,
    fontSize: 16,
    paddingVertical: 12,
  },

  eye: { paddingLeft: 10 },
  strengthInline: { fontSize: 12, marginRight: 8 },
  dropdownHeader: { flexDirection: "row", alignItems: "center", marginBottom: 5, justifyContent: "flex-end" },
  dropdownText: { color: theme.SUBTEXT, fontSize: 15, marginRight: 5 },
  requireBox: {
    backgroundColor: theme.CARD_BG,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.BORDER,
  },

  reqItem: { color: theme.SUBTEXT, fontSize: 14, marginBottom: 6 },
  button: {
    backgroundColor: theme.CARD_BG,
    borderWidth: 1,
    borderColor: theme.BORDER,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: theme.ACCENT,
    fontSize: 16,
    fontWeight: "600",
  },

  errorMsg: { color: theme.ACCENT, textAlign: "center", marginBottom: 0, fontSize: 14, fontWeight: "500" },
  topText: {
    color: theme.TEXT,
    fontSize: 30,
    fontWeight: "600",
    alignSelf: "center",
    marginBottom: 30,
  },

  loginText: {
    color: theme.SUBTEXT,
    textAlign: "center",
    fontSize: 15,
  },

  loginLink: {
    color: theme.ACCENT,
    fontWeight: "600",
  },

  or: { color: theme.SUBTEXT, marginVertical: 20, textAlign: "center" },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.CARD_BG,
    borderWidth: 1,
    borderColor: theme.BORDER,
    paddingVertical: 14,
    borderRadius: 16,
    width: "100%",
    marginBottom: 20,
    gap: 12,
  },

  googleText: {
    color: theme.TEXT,
    fontSize: 15,
    fontWeight: "600",
  },

  bgTop: {
    position: "absolute", top: -135, right: -135, width: 260, height: 260, backgroundColor: "rgba(245,199,122,0.08)", borderRadius: 200, opacity: 0.35, borderWidth: 2,
    borderColor: theme.BORDER,
  },
  bgBottom: {
    position: "absolute", bottom: -160, left: -160, width: 300, height: 300, backgroundColor: "rgba(245,199,122,0.08)", borderRadius: 200, opacity: 0.3, borderWidth: 2,
    borderColor: theme.BORDER,
  },
});
