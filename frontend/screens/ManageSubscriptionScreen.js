import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Linking,
    ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { getSubscriptionStatus } from "../api/api";

const ManageSubscriptionScreen = () => {
    const navigation = useNavigation();

    const [loading, setLoading] = useState(true);
    const [plan, setPlan] = useState(null);
    const [expiryDate, setExpiryDate] = useState(null);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [autoRenew, setAutoRenew] = useState("Enabled");

    useEffect(() => {
        const load = async () => {
            const status = await getSubscriptionStatus();

            setIsSubscribed(status?.isSubscribed || false);
            setExpiryDate(status?.expiryDate || null);

            // 🚀 Set plan label (industry standard names)
            if (status?.productId === "monthly_plan") setPlan("Monthly Plan");
            else if (status?.productId === "yearly_plan") setPlan("Yearly Plan");
            else setPlan("Premium Plan");

            // 🚀 Auto-Renew logic
            setAutoRenew(status?.isSubscribed ? "Enabled" : "Disabled");

            setLoading(false);
        };

        load();
    }, []);

    const openGooglePlaySubscriptions = () => {
        Linking.openURL("https://play.google.com/store/account/subscriptions");
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#8d69e0" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#7c7a7aff" />
                    <Text style={styles.headerTitleb}>Back</Text>
                </Pressable>
                <Text style={styles.headerTitle}>Manage Subscription</Text>
            </View>

            <View style={styles.content}>
                {isSubscribed ? (
                    <View style={styles.box}>
                        <Text style={styles.title}>Your Subscription</Text>

                        {/* PLAN */}
                        <View style={styles.row}>
                            <Ionicons name="star" size={22} color="#ffd700" />
                            <Text style={styles.value}>{plan}</Text>
                        </View>

                        {/* BILLING DATE */}
                        <View style={styles.row}>
                            <Ionicons name="calendar-outline" size={22} color="#8d69e0" />
                            <Text style={styles.value}>
                                Next Billing Date:{" "}
                                {expiryDate ? new Date(expiryDate).toDateString() : "N/A"}
                            </Text>
                        </View>

                        {/* AUTO RENEW */}
                        <View style={styles.row}>
                            <Ionicons name="sync-circle-outline" size={22} color="#8d69e0" />
                            <Text style={styles.value}>Auto-Renew: {autoRenew}</Text>

                            {/* Toggle Button (Always opens Google Play) */}
                            <Pressable
                                style={[
                                    styles.toggleBtn,
                                    autoRenew === "Enabled" ? styles.toggleOn : styles.toggleOff
                                ]}
                                onPress={openGooglePlaySubscriptions}
                            >
                                <Text style={styles.toggleText}>
                                    {autoRenew === "Enabled" ? "Disable" : "Enable"}
                                </Text>
                            </Pressable>
                        </View>


                        {/* CANCEL SUBSCRIPTION BUTTON */}
                        <Pressable
                            style={styles.cancelButton}
                            onPress={openGooglePlaySubscriptions}
                        >
                            <Text style={styles.cancelText}>Cancel Subscription</Text>
                        </Pressable>

                        <Text style={styles.note}>
                            You will be redirected to Google Play to manage your subscription.
                        </Text>
                    </View>
                ) : (
                    <View style={styles.box}>
                        <Text style={styles.title}>No Active Subscription</Text>
                        <Text style={styles.note}>
                            You currently don’t have an active subscription.
                        </Text>

                        <Pressable
                            style={styles.upgradeBtn}
                            onPress={() => navigation.navigate("Subscription")}
                        >
                            <Text style={styles.upgradeText}>Upgrade to Premium</Text>
                        </Pressable>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

export default ManageSubscriptionScreen;

/* ==========================================================
                        STYLES
========================================================== */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1a1822ff",
    },

    header: {
        flexDirection: "column",
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#292929ff",
    },

    backButton: {
        flexDirection: "row",
        alignItems: "center",
    },

    headerTitle: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#dbd8d8ff",
        marginTop: 10,
    },

    headerTitleb: {
        color: "#7c7a7aff",
        marginLeft: 1,
        fontSize: 15,
    },

    content: {
        padding: 20,
    },

    box: {
        backgroundColor: "#1F1D29",
        borderRadius: 16,
        padding: 18,
    },

    title: {
        color: "white",
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 15,
    },

    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
    },

    value: {
        color: "#dbd8d8ff",
        marginLeft: 12,
        fontSize: 15,
    },

    cancelButton: {
        backgroundColor: "#ce1f1f",
        paddingVertical: 12,
        borderRadius: 10,
        marginTop: 20,
        alignItems: "center",
    },

    cancelText: {
        color: "white",
        fontSize: 15,
        fontWeight: "600",
    },

    note: {
        color: "#aaa",
        marginTop: 12,
        fontSize: 13,
    },

    upgradeBtn: {
        backgroundColor: "#8d69e0",
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 15,
    },

    upgradeText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    toggleBtn: {
  marginLeft: "auto",
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 8,
},

toggleOn: {
  backgroundColor: "#ce1f1f",
},

toggleOff: {
  backgroundColor: "#4caf50",
},

toggleText: {
  color: "white",
  fontSize: 13,
  fontWeight: "600",
},

});
