import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Modal,
  ScrollView
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SubscriptionScreen = ({ autoOpen = true, onClose }) => {
  const navigation = useNavigation();
  const [selectedPlan, setSelectedPlan] = useState("1");
  const [loginPopup, setLoginPopup] = useState(false);
  const [trialEnabled, setTrialEnabled] = useState(false);
  const [successPopup, setSuccessPopup] = useState(false);

  const glowAnimation = useRef(new Animated.Value(0.95)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

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

  const handleToggleFreeTrial = () => setTrialEnabled(!trialEnabled);

  const handleSubscribe = async () => {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      setLoginPopup(true);
      return;
    }

    const sku = selectedPlan === "1" ? "monthly_plan" : "yearly_plan";

    try {
      const now = Date.now();
      let trialEndDate = null;

      if (trialEnabled) {
        trialEndDate = now + 7 * 24 * 60 * 60 * 1000;

        await fetch("https://my-ai-captions.onrender.com/api/subscription/start-trial", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId: sku }),
        });
      }

      let premiumStartDate = trialEnabled ? trialEndDate : now;

      let expiryDate =
        selectedPlan === "1"
          ? premiumStartDate + 30 * 24 * 60 * 60 * 1000
          : premiumStartDate + 365 * 24 * 60 * 60 * 1000;

      await fetch("https://my-ai-captions.onrender.com/api/subscription/verify", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: sku,
          purchaseToken: "TEST",
          transactionId: "TEST",
          expiryDate,
          platform: "test_mode",
        }),
      });

      setSuccessPopup(true);
      successAnim.setValue(0);

      Animated.spring(successAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
      }).start();

      setTimeout(() => {
        setSuccessPopup(false);
        navigation.navigate("Home");
      }, 1500);
    } catch (error) {
      console.log("Subscription Error:", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#1a1822ff" }}>
      
      {/* SAFE CLOSE BUTTON (ADDED WRAPPER ONLY) */}
      <View style={{ position: "absolute", top: 0, right: 0, zIndex: 10 }}>
        <Pressable style={styles.closeBtn} onPress={onClose || (() => navigation.goBack())}>
          <Ionicons name="close" size={28} color="#b5b5b5" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >

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
              <Ionicons name="checkmark-circle" size={20} color="#f5c543ff" style={{ marginRight: 8 }} />
              <Text style={styles.featureText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.freeTrial}>
          <Text style={styles.freeTrialText}>✨ 7 Days Free Trial Available ✨</Text>
        </View>

        <View style={[styles.trialRow, trialEnabled && { borderColor: "#f5c543ff", backgroundColor: "#C9A22722" }]}>
          <Text style={styles.trialTextLeft}>Enable Free Trial</Text>

          <Pressable onPress={handleToggleFreeTrial}>
            <View style={[styles.switchTrack, trialEnabled ? styles.switchTrackOn : styles.switchTrackOff]}>
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
                selectedPlan === plan.id && { borderColor: "#f5c543ff", backgroundColor: "#C9A22722" },
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

      </ScrollView>

      {/* POPUPS UNCHANGED */}
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

      <Modal visible={successPopup} transparent>
        <View style={styles.popupOverlay}>
          <Animated.View
            style={[
              styles.successBox,
              {
                transform: [
                  {
                    scale: successAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1],
                    }),
                  },
                ],
                opacity: successAnim,
              },
            ]}
          >
            <Ionicons name="checkmark-circle" size={60} color="#7d5df8" />
            <Text style={styles.successText}>Subscription Activated!</Text>
          </Animated.View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

export default SubscriptionScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1a1822ff",
    paddingHorizontal: 20,
    justifyContent: "flex-start",
    paddingTop: 50,
  },
  closeBtn: { 
  padding: 10,
  marginTop: 10,
  marginRight: 10
},
  freeTrial: {
    alignSelf: "center",
    backgroundColor: "#7d5df8",
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 10,
  },
  freeTrialText: { color: "white", fontSize: 13, fontWeight: "700" },
  headerBox: { alignItems: "center", marginVertical: 20 },
  title: { color: "white", fontSize: 32, fontWeight: "700", marginBottom: 4 },
  subtitle: { color: "#b5b5b5", fontSize: 15 },
  featureBox: { marginBottom: 30, marginTop: 10 },
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
  trialTextLeft: { color: "#fff", fontSize: 16, fontWeight: "700" },

  switchTrack: {
    width: 50,
    height: 28,
    borderRadius: 20,
    justifyContent: "center",
    padding: 0,
  },
  switchTrackOn: { backgroundColor: "#C9A227" },
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
    borderWidth: 2,
    borderColor: "#3c3950",
  },
  planTitle: { color: "white", fontSize: 17, fontWeight: "600" },
  planPrice: { color: "yellow", fontSize: 22, fontWeight: "700", marginTop: 3 },
  planPeriod: { color: "#888", fontSize: 14 },

  tagBox: {
    backgroundColor: "white",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: "center",
  },
  tagText: { color: "black", fontSize: 12, fontWeight: "700" },

  subscribeBtn: {
    backgroundColor: "#7d5df8",
    marginTop: 20,
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
 successOverlay: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.6)",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999,
},
successBox: {
  backgroundColor: "#2a2736",
  padding: 30,
  borderRadius: 20,
  alignItems: "center",
},
successText: {
  color: "white",
  fontSize: 20,
  fontWeight: "700",
  marginTop: 10,
},

});
