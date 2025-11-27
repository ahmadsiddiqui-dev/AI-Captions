import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Keyboard,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logoutUser, updateName } from "../api/api";

const Settings = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setTempName(parsed.name);
      }
    };
    loadUser();
  }, []);

  const handleSaveName = async () => {
    if (!tempName.trim()) return;

    const updatedUser = { ...user, name: tempName.trim() };

    setUser(updatedUser);
    await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

    Keyboard.dismiss();
    setIsEditing(false);

    updateName(tempName.trim()).catch(() => {});
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("token");

      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  const Item = ({ icon, title, onPress, showArrow = true }) => (
    <Pressable style={styles.row} onPress={onPress}>
      <Ionicons name={icon} size={18} color="#7da8ff" />
      <Text style={styles.rowText}>{title}</Text>
      {showArrow && <Ionicons name="chevron-forward" size={18} color="#777" />}
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* HEADER */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={26} color="white" />
          </Pressable>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>

          {/* ACCOUNT */}
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionBox}>
            {user ? (
              <>
                {/* Name */}
                <View style={styles.row}>
                  <Ionicons name="person-outline" size={18} color="#7da8ff" />

                  <TextInput
                    value={tempName}
                    onChangeText={setTempName}
                    editable={isEditing}
                    autoFocus={isEditing}
                    style={{
                      color: "white",
                      fontSize: 16,
                      flex: 1,
                      marginLeft: 12,
                    }}
                  />

                  <Pressable
                    onPress={() =>
                      isEditing ? handleSaveName() : setIsEditing(true)
                    }
                  >
                    <Ionicons
                      name={isEditing ? "checkmark" : "create-outline"}
                      size={20}
                      color="#7da8ff"
                    />
                  </Pressable>
                </View>

                {/* Email */}
                <View style={styles.row}>
                  <Ionicons name="mail-outline" size={18} color="#7da8ff" />
                  <Text style={styles.emailText}>{user.email}</Text>
                </View>
              </>
            ) : (
              <>
                <Item
                  title="Login"
                  icon="log-in-outline"
                  onPress={() => navigation.navigate("Login")}
                />
                <Item
                  title="Register"
                  icon="person-add-outline"
                  onPress={() => navigation.navigate("Register")}
                />
              </>
            )}
          </View>

          {/* SUBSCRIPTION — ADDED BACK */}
          <Text style={styles.sectionTitle}>Subscription</Text>
          <View style={styles.sectionBox}>
            <Item title="Upgrade" icon="star-outline" />
            <Item title="Restore Purchases" icon="refresh-outline" />
          </View>

          {/* FEEDBACK */}
          <Text style={styles.sectionTitle}>Feedback</Text>
          <View style={styles.sectionBox}>
            <Item
              title="Contact Support"
              icon="mail-outline"
              onPress={() =>
                Linking.openURL(
                  "mailto:ahmadsiddiqui909@gmail.com?subject=Support Request"
                )
              }
            />
          </View>

          {/* PRIVACY & LEGAL — ADDED BACK */}
          <Text style={styles.sectionTitle}>Privacy & Legal</Text>
          <View style={styles.sectionBox}>
            <Item title="Privacy Policy" icon="shield-checkmark-outline" />
            <Item title="Terms of Service" icon="document-text-outline" />
          </View>

          {/* LOGOUT */}
          {user && (
            <View style={styles.logoutWrapper}>
              <Pressable style={styles.logoutBtn} onPress={handleLogout}>
                <Text style={styles.logoutText}>Logout</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Settings;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#000" },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { flexDirection: "row", alignItems: "center", paddingVertical: 15 },
  backButton: { padding: 5, marginRight: 5 },
  headerTitle: { fontSize: 22, fontWeight: "600", color: "white" },
  sectionTitle: { color: "#8A8A8D", fontSize: 14, marginTop: 20, marginBottom: 10, marginLeft: 5 },
  sectionBox: {
    backgroundColor: "#1c1c1e",
    borderRadius: 14,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 15,
    borderBottomWidth: 0.3,
    borderBottomColor: "#2a2a2c",
  },
  rowText: { flex: 1, fontSize: 16, color: "#f5f5f7", marginLeft: 12 },
  emailText: { flex: 1, color: "#9e9e9e", fontSize: 16, opacity: 0.8, marginLeft: 12 },
  logoutWrapper: { marginTop: 25, alignItems: "center" },
  logoutBtn: {
    backgroundColor: "#ce1f1fff",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    width: "40%",
  },
  logoutText: { color: "white", fontSize: 16, fontWeight: "600" },
});
