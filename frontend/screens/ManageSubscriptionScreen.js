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
import { useTheme } from "../src/theme/ThemeContext";

const ACCENT_GOLD = "#F5C77A";

const ManageSubscriptionScreen = () => {
    const navigation = useNavigation();

    const [loading, setLoading] = useState(true);
    const [plan, setPlan] = useState(null);
    const [expiryDate, setExpiryDate] = useState(null);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [autoRenew, setAutoRenew] = useState("Enabled");
    const { theme, toggleTheme } = useTheme();
    const styles = createStyles(theme);

    useEffect(() => {
        const load = async () => {
            const status = await getSubscriptionStatus();
            console.log("STATUS:", status);

            setIsSubscribed(status?.isSubscribed || false);
            setExpiryDate(status?.expiryDate || null);

            const pid = status?.productId?.toLowerCase()?.replace(/[^a-z_]/g, "");

            let planName = "Premium Plan";

            if (pid?.includes("month")) planName = "Monthly Plan";
            else if (pid?.includes("year")) planName = "Yearly Plan";

            setPlan(planName);

            setAutoRenew(status?.autoRenew === false ? "Disabled" : "Enabled");

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
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size="large" color={theme.ACCENT} style={{ transform: [{ scale: 2 }] }} />
                </View>
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
                            <Ionicons name="star-outline" size={22} color={theme.ACCENT} />
                            <Text style={styles.value}>{plan}</Text>
                        </View>

                        {/* BILLING DATE */}
                        <View style={styles.row}>
                            <Ionicons name="calendar-outline" size={22} color={theme.ICON} />
                            <Text style={styles.value}>
                                Next Billing Date:{" "}
                                {expiryDate ? new Date(expiryDate).toDateString() : "N/A"}
                            </Text>
                        </View>

                        {/* AUTO RENEW */}
                        <View style={styles.row}>
                            <Ionicons name="sync-circle-outline" size={22} color={theme.ICON} />
                            <Text style={styles.value}>Auto-Renew: {autoRenew}</Text>

                            {/* Toggle Button (Always opens Google Play) */}
                            <Pressable
                                onPress={openGooglePlaySubscriptions}
                                style={({ pressed }) => [
                                    styles.toggleBtn,
                                    autoRenew === "Enabled" ? styles.toggleOn : styles.toggleOff,
                                    pressed && { opacity: 0.75 },
                                ]}
                            >
                                <Text style={styles.toggleText}>
                                    {autoRenew === "Enabled" ? "Disable" : "Enable"}
                                </Text>
                            </Pressable>

                        </View>


                        {/* CANCEL SUBSCRIPTION BUTTON */}
                        <Pressable
                            onPress={openGooglePlaySubscriptions}
                            style={({ pressed }) => [
                                styles.cancelButton,
                                pressed && { opacity: 0.75 },
                            ]}
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

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.BG,
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
        color: theme.TEXT,
        marginTop: 10,
    },

    headerTitleb: {
        color: theme.SUBTEXT,
        marginLeft: 1,
        fontSize: 15,
    },

    content: {
        padding: 20,
    },

    box: {
        backgroundColor: theme.CARD_BG,
        borderRadius: 18,
        padding: 18,
        borderWidth: 1,
        borderColor: theme.BORDER,
    },


    title: {
        color: theme.TEXT,
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 15,
    },

    value: {
        color: theme.TEXT,
        marginLeft: 12,
        fontSize: 15,
    },

    note: {
        color: theme.SUBTEXT,
        marginTop: 12,
        fontSize: 13,
    },


    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
    },

    cancelButton: {
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 20,
        alignItems: "center",
        backgroundColor: "rgba(255, 69, 58, 0.08)",
        borderWidth: 1,
        borderColor: "rgba(255, 69, 58, 0.35)",
    },

    cancelText: {
        color: "#FF453A",
        fontSize: 15,
        fontWeight: "600",
    },

    upgradeBtn: {
        backgroundColor: "rgba(245,199,122,0.18)",
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: "center",
        marginTop: 15,
        borderWidth: 1,
        borderColor: ACCENT_GOLD,
    },

    upgradeText: {
        color: ACCENT_GOLD,
        fontSize: 16,
        fontWeight: "700",
    },

    toggleBtn: {
        marginLeft: "auto",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },

    toggleOn: {
        backgroundColor: "rgba(255, 69, 58, 0.08)",
        borderWidth: 1,
        borderColor: "rgba(255, 69, 58, 0.35)",
    },

    toggleOff: {
        backgroundColor: "#4caf50",
    },

    toggleText: {
        color: theme.TEXT,
        fontSize: 13,
        fontWeight: "600",
    },

});
