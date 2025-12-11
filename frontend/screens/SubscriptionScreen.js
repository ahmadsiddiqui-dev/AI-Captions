import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Animated,
  Modal
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SubscriptionScreen = ({ autoOpen = true, onClose }) => {
  const navigation = useNavigation();
  const [selectedPlan, setSelectedPlan] = useState("1");
  const [loginPopup, setLoginPopup] = useState(false);
  const [trialEnabled, setTrialEnabled] = useState(false);

  const glowAnimation = useRef(new Animated.Value(0.95)).current;

  const plans = [
    { id: "1", title: "Monthly", price: "$4.99", period: "/month", tag: "POPULAR" },
    { id: "2", title: "Yearly", price: "$29.99", period: "/year", tag: "SAVE 50%" },
  ];

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnimation, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(glowAnimation, { toValue: 0.95, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleToggleFreeTrial = () => {
    setTrialEnabled(!trialEnabled);
  };

const handleSubscribe = async () => {
  const token = await AsyncStorage.getItem("token");

  if (!token) {
    setLoginPopup(true);
    return;
  }

  // If FREE TRIAL is enabled → start trial
  if (trialEnabled) {
    try {
      const res = await fetch(
        "https://my-ai-captions.onrender.com/api/subscription/start-trial",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        await AsyncStorage.setItem("subscribed", "true");
        navigation.goBack();
        return;
      }
    } catch (error) {
      console.log("Trial Error:", error);
    }
  }

};

  return (
    <SafeAreaView style={styles.container}>

      <Pressable style={styles.closeBtn} onPress={onClose || (() => navigation.goBack())}>
        <Ionicons name="close" size={28} color="#b5b5b5" />
      </Pressable>

      <View style={styles.headerBox}>
        <Text style={styles.title}>Go Premium ✨</Text>
        <Text style={styles.subtitle}>Unlock unlimited captions & AI features</Text>
      </View>

      <View style={styles.featureBox}>
        {[
          "Unlimited caption generation",
          "No daily limits",
          "All moods & languages",
          "Priority response speed",
        ].map((item, index) => (
          <View key={index} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color="#7d5df8" style={{ marginRight: 8 }} />
            <Text style={styles.featureText}>{item}</Text>
          </View>
        ))}
      </View>

      <View style={styles.freeTrial}>
        <Text style={styles.freeTrialText}>✨ 7 Days Free Trial Available ✨</Text>
      </View>

      <View style={[styles.trialRow, trialEnabled && { borderColor: "#7d5df8" }]}>
        <Text style={styles.trialTextLeft}>Enable Free Trial</Text>

        <Pressable onPress={handleToggleFreeTrial}>
          <View
            style={[
              styles.switchTrack,
              trialEnabled ? styles.switchTrackOn : styles.switchTrackOff
            ]}
          >
            <Animated.View
              style={[
                styles.switchThumb,
                { transform: [{ translateX: trialEnabled ? 22 : 2 }] }
              ]}
            />
          </View>
        </Pressable>
      </View>

      <View style={{ width: "100%", marginTop: 20 }}>
        {plans.map((plan) => (
          <Pressable
            key={plan.id}
            style={[
              styles.planCard,
              selectedPlan === plan.id && { borderColor: "#7d5df8", backgroundColor: "#2a2736" },
            ]}
            onPress={() => setSelectedPlan(plan.id)}
          >
            <View>
              <Text style={styles.planTitle}>{plan.title}</Text>
              <Text style={styles.planPrice}>
                {plan.price}<Text style={styles.planPeriod}>{plan.period}</Text>
              </Text>
            </View>

            <View style={styles.tagBox}>
              <Text style={styles.tagText}>{plan.tag}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      <Animated.View style={{ transform: [{ scale: glowAnimation }] }}>
        <Pressable style={styles.subscribeBtn} onPress={handleSubscribe}>
          <Text style={styles.subscribeText}>Upgrade Now</Text>
        </Pressable>
      </Animated.View>

      <Pressable>
        <Text style={styles.restoreText}>Restore Purchases</Text>
      </Pressable>

      <Modal visible={loginPopup} transparent animationType="fade">
        <View style={styles.popupOverlay}>
          <View style={styles.popupBox}>
            <Text style={styles.popupTitle}>Login Required</Text>
            <Text style={styles.popupDesc}>Please login to continue.</Text>

            <Pressable
              style={styles.loginBtn}
              onPress={() => {
                setLoginPopup(false);
                navigation.navigate("Login");
              }}
            >
              <Text style={styles.loginBtnText}>Login</Text>
            </Pressable>

            <Pressable onPress={() => setLoginPopup(false)} style={{ marginTop: 10 }}>
              <Text style={{ color: "#bbb" }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

export default SubscriptionScreen;

// ================= STYLES ==================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1822ff",
    paddingHorizontal: 20,
    justifyContent: "flex-start",
    paddingTop: 50,
  },
  closeBtn: { position: "absolute", top: 10, right: 10, padding: 10 },
  freeTrial: {
    alignSelf: "center",
    backgroundColor: "#7d5df8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 10,
  },
  freeTrialText: { color: "white", fontSize: 13, fontWeight: "700" },
  headerBox: { alignItems: "center", marginVertical: 20 },
  title: { color: "white", fontSize: 32, fontWeight: "700", marginBottom: 4 },
  subtitle: { color: "#b5b5b5", fontSize: 15 },
  featureBox: { marginBottom: 30, marginTop: 10, },
  featureRow: { flexDirection: "row", alignItems: "center", marginVertical: 6 },
  featureText: { color: "white", fontSize: 14 },

  trialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    width: "100%",
    backgroundColor: "#2a2736",
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: "#3c3950",
    paddingHorizontal: 15,
  },
  trialTextLeft: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  switchTrack: {
    width: 50,
    height: 28,
    borderRadius: 20,
    justifyContent: "center",
    padding: 0,
  },
  switchTrackOn: { backgroundColor: "#7d5df8" },
  switchTrackOff: { backgroundColor: "#555" },
  switchThumb: {
    width: 24,
    height: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    position: "absolute",
  },

  planCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#242230",
    padding: 18,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#3c3950",
  },
  planTitle: { color: "white", fontSize: 17, fontWeight: "600" },
  planPrice: { color: "#7d5df8", fontSize: 22, fontWeight: "700", marginTop: 3 },
  planPeriod: { color: "#888", fontSize: 14 },

  tagBox: {
    backgroundColor: "#7d5df8",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: "center",
  },
  tagText: { color: "white", fontSize: 12, fontWeight: "700" },

  subscribeBtn: {
    backgroundColor: "#7d5df8",
    marginTop: 30,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  subscribeText: { color: "white", fontSize: 17, fontWeight: "700" },
  restoreText: { color: "#7da8ff", textAlign: "center", marginTop: 12 },

  popupOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  popupBox: {
    width: 280,
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#2a2736",
    alignItems: "center",
  },
  popupTitle: { color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 8 },
  popupDesc: { color: "#bbb", fontSize: 14, textAlign: "center", marginBottom: 15 },
  loginBtn: {
    backgroundColor: "#7d5df8",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  loginBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
