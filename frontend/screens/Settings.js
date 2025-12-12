import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Keyboard,
  Linking,
  ActivityIndicator
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { logoutUser, updateName, getSubscriptionStatus } from "../api/api";

const Settings = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState("");

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [freeTrial, setFreeTrial] = useState(false);

  const [loadingSub, setLoadingSub] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");

        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          console.log("[Settings] parsed user:", parsed);
          setUser(parsed);
          setTempName(parsed.name);
        }

        const status = await getSubscriptionStatus();

        setIsSubscribed(status?.isSubscribed || false);
        setFreeTrial(status?.freeTrialEnabled || false);

        setLoadingSub(false);

      } catch (e) {
        setLoadingSub(false);
      }
    };

    loadUser();
  }, []);

  if (loadingSub) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#8d69e0" style={{ transform: [{ scale: 2 }] }} />
        </View>
      </SafeAreaView>
    );
  }

  const handleSaveName = async () => {
    if (!tempName.trim()) return;

    const updatedUser = { ...user, name: tempName.trim() };
    setUser(updatedUser);

    await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
    updateName(tempName.trim()).catch(() => { });

    Keyboard.dismiss();
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("popupShown");

      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  const Item = ({ icon, title, onPress, showArrow = true, style }) => (
    <Pressable style={[styles.row, style]} onPress={onPress}>
      <Ionicons name={icon} size={18} color="#7da8ff" />
      <Text style={styles.rowText}>{title}</Text>
      {showArrow && <Ionicons name="chevron-forward" size={18} color="#777" />}
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#7c7a7aff" />
          <Text style={styles.headerTitleb}>Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* ACCOUNT */}
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionBox}>
            {user ? (
              <>
                {/* Name + PRO Badge */}
                <View style={styles.rows}>
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
                      paddingVertical: 0,
                    }}
                  />

                  {(isSubscribed || freeTrial) && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: "#4b007d",
                        borderRadius: 12,
                        paddingVertical: 4,
                        paddingHorizontal: 10,
                        marginRight: 20,
                        borderWidth: 1,
                        borderColor: "#c77dff",
                      }}
                    >
                      <Ionicons name="diamond" size={14} color="#ffd700" style={{ marginRight: 4 }} />
                      <Text style={{ color: "#ffd700", fontSize: 12, fontWeight: "700" }}>
                        PRO
                      </Text>
                    </View>
                  )}

                  <Pressable
                    onPress={() => (isEditing ? handleSaveName() : setIsEditing(true))}
                  >
                    <Ionicons
                      name={isEditing ? "checkmark" : "create-outline"}
                      size={20}
                      color="#7da8ff"
                    />
                  </Pressable>
                </View>

                {/* EMAIL */}
                <View className="row" style={styles.row}>
                  <Ionicons name="mail-outline" size={18} color="#7da8ff" />
                  <Text style={styles.emailText}>{user.email}</Text>
                </View>
              </>
            ) : (
              <>
                <Item
                  title="Login"
                  icon="log-in-outline"
                  style={{
                    borderBottomWidth: 0.8,
                    borderBottomColor: "#383737ff",
                  }}
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

          {/* SUBSCRIPTION SECTION */}
          <Text style={styles.sectionTitle}>Subscription</Text>
          <View style={styles.sectionBox}>
            {(isSubscribed || freeTrial) ? (
              <>
                {/* Premium User */}
                <View
                  style={[
                    styles.row,
                    { borderBottomWidth: 0.8, borderBottomColor: "#383737ff" },
                  ]}
                >
                  <Ionicons name="star" size={18} color="#ffd700" />
                  <Text style={[styles.rowText, { color: "#ffd700" }]}>PRO Member</Text>
                </View>

                {/* Manage Subscription */}
                <Pressable
                  style={styles.row}
                  onPress={() => navigation.navigate("ManageSubscription")}
                >
                  <Ionicons name="settings-outline" size={18} color="#7da8ff" />
                  <Text style={styles.rowText}>Manage Subscription</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Item
                  title="Upgrade"
                  icon="star-outline"
                  onPress={() => navigation.navigate("Subscription")}
                  style={{
                    borderBottomWidth: 0.8,
                    borderBottomColor: "#383737ff",
                  }}
                />
                <Item title="Restore Purchases" icon="refresh-outline" />
              </>
            )}
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

          {/* PRIVACY */}
          <Text style={styles.sectionTitle}>Privacy & Legal</Text>
          <View style={styles.sectionBox}>
            <Item
              title="Privacy Policy"
              icon="shield-checkmark-outline"
              style={{
                borderBottomWidth: 0.8,
                borderBottomColor: "#383737ff",
              }}
            />
            <Item title="Terms of Service" icon="document-text-outline" />
          </View>

          {/* LOGOUT */}
          {user && (
            <View style={styles.logoutWrapper}>
              <Pressable
                onPress={handleLogout}
                style={({ pressed }) => [
                  styles.logoutBtn,
                  pressed && { transform: [{ scale: 0.96 }], opacity: 0.8 },
                ]}
              >
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
  safeArea: { flex: 1, backgroundColor: "#1a1822ff" },
  container: { flex: 1, paddingHorizontal: 12 },
  header: {
    flexDirection: "coloum",
    alignItems: "left",
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#292929ff",
  },
  backButton: { flexDirection: "row", alignItems: "center" },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#dbd8d8ff",
    marginTop: 14,
    paddingHorizontal: 14,
  },
  headerTitleb: { color: "#7c7a7aff", marginLeft: 1, fontSize: 15, fontWeight: "400" },
  sectionTitle: { color: "#8A8A8D", fontSize: 14, marginTop: 20, marginBottom: 10, marginLeft: 5 },
  sectionBox: {
    backgroundColor: "#1F1D29",
    borderRadius: 14,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 15,
  },
  rows: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 15,
    borderBottomWidth: 0.8,
    borderBottomColor: "#383737ff",
  },
  rowText: { flex: 1, fontSize: 15, color: "#dbd8d8ff", marginLeft: 18 },
  emailText: { flex: 1, color: "#9e9e9e", fontSize: 16, opacity: 0.8, marginLeft: 18 },
  logoutWrapper: { marginTop: 25, alignItems: "center" },
  logoutBtn: {
    backgroundColor: "#ce1f1fff",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    width: "40%",
  },
  logoutText: { color: "#dbd8d8ff", fontSize: 16, fontWeight: "600" },
});
