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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginUser } from "../api/api"; 

const LoginScreen = () => {
  const navigation = useNavigation();

  const [showPass, setShowPass] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={26} color="white" />
        </Pressable>
        <Text style={styles.headerTitle}>Login</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.centerWrapper}>
          <Text style={styles.topText}>Welcome Back!</Text>

          <View style={styles.box}>
            <Text style={styles.label}>Email</Text>
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

            <Text style={styles.label}>Password</Text>
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

            {errorMessage ? (
              <Text style={styles.errorMsg}>{errorMessage}</Text>
            ) : null}

            <Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
              <Text style={styles.buttonText}>
                {loading ? "Please wait..." : "Login"}
              </Text>
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

// Styling unchanged
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
    marginRight: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "white",
  },
  centerWrapper: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 40,
  },
  topText: {
    color: "white",
    fontSize: 22,
    fontWeight: "600",
    alignSelf: "center",
    marginBottom: 25,
  },
  box: {
    backgroundColor: "#1c1c1e",
    borderRadius: 18,
    padding: 20,
  },
  label: {
    color: "#8a8a8d",
    fontSize: 14,
    marginBottom: 6,
    marginTop: 10,
  },
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
    marginBottom: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  inputField: {
    flex: 1,
    color: "white",
    fontSize: 16,
    paddingVertical: 14,
  },
  eye: {
    paddingLeft: 10,
  },
  forgot: {
    color: "#7da8ff",
    marginBottom: 20,
    fontSize: 14,
  },
  button: {
    backgroundColor: "#7d5df8",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  errorMsg: {
    color: "#ff6b6b",
    textAlign: "center",
    marginBottom: 10,
    fontSize: 14,
    fontWeight: "500",
  },
  registerText: {
    color: "#b5b5b5",
    textAlign: "center",
    marginTop: 10,
    fontSize: 15,
  },
  registerLink: {
    color: "#7da8ff",
    fontWeight: "600",
  },
});
