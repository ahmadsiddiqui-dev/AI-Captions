import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Keyboard,
  Linking,
  ActivityIndicator,
  Animated,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showRatePopup } from '../src/utils/rateHelper';

import { logoutUser, updateName, getSubscriptionStatus } from "../api/api";

const Settings = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const nameInputRef = useRef(null);

  const [tempName, setTempName] = useState("");
  const isNameValid = (tempName || "").trim().length >= 3;


  const [isSubscribed, setIsSubscribed] = useState(false);
  const [freeTrial, setFreeTrial] = useState(false);

  const [loadingSub, setLoadingSub] = useState(true);

  useEffect(() => {
    if (isEditing) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [isEditing]);


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
          <ActivityIndicator size="large" color="#F5C77A" style={{ transform: [{ scale: 2 }] }} />
        </View>
      </SafeAreaView>
    );
  }

  const handleSaveName = async () => {
    const trimmedName = tempName.trim();

    if (trimmedName.length < 3) return;

    const updatedUser = { ...user, name: trimmedName };
    setUser(updatedUser);

    await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
    updateName(trimmedName).catch(() => { });

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

  const Item = ({ icon, title, onPress, showArrow = true, style }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const opacity = useRef(new Animated.Value(1)).current;

    const onPressIn = () => {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 0.98,
          friction: 7,
          tension: 90,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const onPressOut = () => {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start();
    };

    return (
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <Animated.View
          style={[
            styles.iosRow,
            style,
            { transform: [{ scale }], opacity },
          ]}
        >
          <Ionicons name={icon} size={18} color="#A1A1A6" />
          <Text style={styles.rowText}>{title}</Text>
          {showArrow && (
            <Ionicons name="chevron-forward" size={18} color="#6f6f6f" />
          )}
        </Animated.View>
      </Pressable>
    );
  };


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
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="always">
          {/* ACCOUNT */}
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionBox}>
            {user ? (
              <>
                {/* Name + PRO Badge */}
                <View style={styles.rows}>
                  <Ionicons name="person-outline" size={18} color="#A1A1A6" />

                  <TextInput
                    ref={nameInputRef}
                    value={tempName}
                    onChangeText={(text) => {
                      if (text.length <= 15) {
                        setTempName(text);
                      }
                    }}
                    maxLength={15}
                    editable={isEditing}
                    autoFocus={false}
                    returnKeyType="done"
                    style={{
                      color: "#EAEAEB",
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
                        backgroundColor: "rgba(245,199,122,0.15)",
                        borderColor: "rgba(245,199,122,0.6)",
                        borderRadius: 12,
                        paddingVertical: 4,
                        paddingHorizontal: 10,
                        marginRight: 20,
                        borderWidth: 1,

                      }}
                    >
                      <Ionicons name="diamond-outline" size={14} color="#F5C77A" style={{ marginRight: 4 }} />
                      <Text style={{ color: "#F5C77A", fontSize: 12, fontWeight: "700" }}>
                        PRO
                      </Text>
                    </View>
                  )}

                  <Pressable
                    onPress={() => {
                      if (isEditing) {
                        if (!isNameValid) return;
                        handleSaveName();
                      } else {
                        setIsEditing(true);
                      }
                    }}
                    disabled={isEditing && !isNameValid}
                    style={isEditing && !isNameValid ? { opacity: 0.5 } : null}
                  >
                    <Ionicons
                      name={isEditing ? "checkmark" : "create-outline"}
                      size={20}
                      color="#A1A1A6"
                    />
                  </Pressable>

                </View>

                {/* EMAIL */}
                <View className="row" style={styles.row}>
                  <Ionicons name="mail-outline" size={18} color="#A1A1A6" />
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
                  <Ionicons name="diamond-outline" size={18} color="#F5C77A" />
                  <Text style={[styles.rowText, { color: "#F5C77A", fontWeight: "600" }]}>PRO Member</Text>
                </View>

                {/* Manage Subscription */}
                <Item
                  title="Manage Subscription"
                  icon="settings-outline"
                  onPress={() => navigation.navigate("ManageSubscription")}
                />
              </>
            ) : (
              <>
                <Item
                  title="Upgrade"
                  icon="diamond-outline"
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
              title="Rate us"
              icon="star-outline"
              style={{
                borderBottomWidth: 0.8,
                borderBottomColor: "#383737ff",
              }}
              onPress={showRatePopup}
            />
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
                  pressed && styles.logoutPressed,
                ]}
              >
                <Text style={styles.logoutText}>Log Out</Text>
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
  safeArea: { flex: 1, backgroundColor: "#141414ff" },
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
  sectionTitle: { color: "#9E9EA2", fontSize: 14, marginTop: 20, marginBottom: 10, marginLeft: 5 },
  sectionBox: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },

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
  rowText: { flex: 1, fontSize: 15, color: "#EAEAEB", marginLeft: 18 },
  emailText: { flex: 1, color: "#9e9e9e", fontSize: 16, opacity: 0.8, marginLeft: 18 },
  logoutWrapper: { marginTop: 25, alignItems: "center" },
  logoutBtn: {
    width: "50%",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "rgba(255, 69, 58, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 69, 58, 0.35)",
    marginTop: 10,
  },

  logoutPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },

  logoutText: {
    color: "#FF453A",
    fontSize: 16,
    fontWeight: "600",
  },



  iosRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 15,
    backgroundColor: "transparent",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.08)",

    marginLeft: 52,
  },
  sectionBoxWrapper: {
    marginBottom: 18,
  },



});
