import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
    TextInput
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

    // LOAD USER FROM STORAGE
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

        const res = await updateName(tempName.trim());

        if (res?.user) {
            await AsyncStorage.setItem("user", JSON.stringify(res.user));
            setUser(res.user);
            setIsEditing(false);
        }
    };

    const handleLogout = async () => {
        try {
            const res = await logoutUser();
            console.log(res.message);

            await AsyncStorage.removeItem("user");
            await AsyncStorage.removeItem("token");

            setUser(null);

            navigation.reset({
                index: 0,
                routes: [{ name: "Settings" }],
            });

        } catch (error) {
            console.log("Logout error:", error);
        }
    };

    // FIXED ITEM COMPONENT (NOW SUPPORTS CUSTOM TEXTINPUT + customRight)
    const Item = ({ icon, title, onPress, showArrow = true, customRight }) => (
        <Pressable
            style={styles.row}
            onPress={onPress}
            disabled={!onPress}
        >
            <Ionicons name={icon} size={18} color="#7da8ff" />

            <View style={{ flex: 1, marginLeft: 12 }}>
                {typeof title === "string" ? (
                    <Text style={styles.rowText}>{title}</Text>
                ) : (
                    title
                )}
            </View>

            {customRight ? customRight :
                showArrow && <Ionicons name="chevron-forward" size={18} color="#777" />
            }
        </Pressable>
    );

    const Section = ({ title, children }) => (
        <View style={styles.section}>
            {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
            <View style={styles.sectionBox}>{children}</View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>

            {/* HEADER */}
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={26} color="white" />
                </Pressable>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>

                {/* ACCOUNT */}
                <Section title="Account">
                    {user ? (
                        <>
                            {/* NAME FIELD WITH EDIT */}
                            <Item
                                icon="person-outline"
                                title={
                                    isEditing ? (
                                        <TextInput
                                            value={tempName}
                                            onChangeText={setTempName}
                                            style={{ color: "white", fontSize: 16 }}
                                            autoFocus
                                        />
                                    ) : (
                                        user.name
                                    )
                                }
                                showArrow={false}
                                customRight={
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
                                }
                            />

                            <Item
                                icon="mail-outline"
                                showArrow={false}
                                title={
                                    <Text style={{ color: "#9e9e9e", fontSize: 16, opacity: 0.8 }}>
                                        {user.email}
                                    </Text>
                                }
                            />
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
                </Section>

                {/* SUBSCRIPTION */}
                <Section title="Subscription">
                    <Item title="Upgrade" icon="star-outline" />
                    <Item title="Restore Purchases" icon="refresh-outline" />
                </Section>

                {/* FEEDBACK */}
                <Section title="Feedback">
                    <Item
                        title="Contact Support"
                        icon="mail-outline"
                        onPress={() => {
                            Linking.openURL("mailto:ahmadsiddiqui909@gmail.com.app?subject=Support Request");
                        }}
                    />
                </Section>

                {/* PRIVACY */}
                <Section title="Privacy & Legal">
                    <Item title="Privacy Policy" icon="shield-checkmark-outline" />
                    <Item title="Terms of Service" icon="document-text-outline" />
                </Section>

                {/* LOGOUT BUTTON */}
                {user && (
                    <View style={styles.logoutWrapper}>
                        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
                            <Text style={styles.logoutText}>Logout</Text>
                        </Pressable>
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
};

export default Settings;

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
        marginBottom: 10,
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

    section: {
        marginTop: 30,
    },
    sectionTitle: {
        color: "#8A8A8D",
        fontSize: 14,
        marginBottom: 10,
        marginLeft: 5,
        fontWeight: "600",
    },
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

    rowText: {
        flex: 1,
        fontSize: 16,
        color: "#f5f5f7",
    },

    logoutWrapper: {
        marginTop: 20,
        alignItems: "center",
    },
    logoutBtn: {
        backgroundColor: "#ce1f1fff",
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: "center",
        width: "40%",
    },
    logoutText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
});
