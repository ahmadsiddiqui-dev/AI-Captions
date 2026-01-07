import React, { useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  Animated,
  Easing,
  PermissionsAndroid,
  Platform,
  useWindowDimensions,
  Modal,
  Linking,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { launchImageLibrary } from "react-native-image-picker";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSubscriptionStatus } from "../api/api";
import { getOrCreateDeviceId } from "../src/utils/deviceId";


const HomeScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const permissionDeniedOnceRef = useRef(false);
  const [permissionPopupVisible, setPermissionPopupVisible] = useState(false);

  useEffect(() => {
      const init = async () => {
    try {
      await getOrCreateDeviceId();
    } catch {}
  };

  init();

    const checkSubscriptionPopup = async () => {
      const token = await AsyncStorage.getItem("token");
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (!token) {
        navigation.navigate("Subscription");
        return;
      }

      const status = await getSubscriptionStatus();
      if (!status.isSubscribed && !status.freeTrialEnabled) {
        navigation.navigate("Subscription");
      }
    };

    checkSubscriptionPopup();
    
  }, []);

  

  const pickImage = async () => {
    if (Platform.OS === "android") {
      const permission =
        Platform.Version >= 33
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

      const hasPermission = await PermissionsAndroid.check(permission);

      if (!hasPermission) {
        if (permissionDeniedOnceRef.current) {
          setPermissionPopupVisible(true);
          return;
        }

        const result = await PermissionsAndroid.request(permission);

        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
          permissionDeniedOnceRef.current = true;
          return;
        }
      }
    }

    launchImageLibrary(
      { mediaType: "photo", selectionLimit: 5 },
      (response) => {
        if (response.assets) {
          navigation.navigate("CaptionGeneratorScreen", {
            selectedImages: response.assets,
          });
        }
      }
    );
  };

  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.07,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.topRight, { top: insets.top + 10 }]}>
        <Pressable onPress={() => navigation.push("Settings")}>
          <Ionicons name="cog-outline" size={30} color="#b3b1b1ff" />
        </Pressable>
      </View>

      <View style={{ flex: 1, flexDirection: isLandscape ? "row" : "column" }}>
        <View
          style={[
            styles.imageWrapper,
            isLandscape && { width: "50%", height: "100%", marginTop: 0 }
          ]}
        >
          <Image
            style={styles.ovalImage}
            source={require("../src/images/img1.png")}
          />
        </View>

        <View
          style={[
            styles.bottomContent,
            isLandscape && {
              position: "relative",
              bottom: 0,
              width: "50%",
              justifyContent: "center",
            },
          ]}
        >
          <Text style={styles.title}>
            Create Your{"\n"}
            <Text style={{ fontWeight: "bold" }}>Perfect Caption!</Text>
          </Text>

          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Pressable style={styles.button} onPress={pickImage}>
              <Ionicons name="folder-outline" size={35} color="white" />
              <Text style={styles.buttonText}>Select Photos</Text>
            </Pressable>
          </Animated.View>

          <Text style={styles.policy}>
            We temporarily process your photos{"\n"}and delete them once your caption is ready.
          </Text>

          <Pressable
            onPress={() =>
              navigation.navigate("CaptionGeneratorScreen", {
                selectedImages: [],
              })
            }
          >
            <Text style={styles.linkText}>Proceed Without Photos</Text>
          </Pressable>
        </View>
      </View>

      <Modal visible={permissionPopupVisible} transparent animationType="fade">
        <Pressable
          style={styles.popupOverlay}
          onPress={() => setPermissionPopupVisible(false)}
        >
          <Pressable
            style={styles.popupBox}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.popupTitle}>Permission Required</Text>

            <Text style={styles.popupText}>
              Please allow photo access from settings to select photos.
            </Text>

            <Pressable
              style={styles.popupBtn}
              onPress={() => {
                setPermissionPopupVisible(false);
                Linking.openSettings();
              }}
            >
              <Text style={styles.popupBtnText}>Open Settings</Text>
            </Pressable>

            <Pressable onPress={() => setPermissionPopupVisible(false)}>
              <Text style={styles.popupCancel}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a1822ff" },

  topRight: {
    position: "absolute",
    right: 20,
    zIndex: 20,
    backgroundColor: "#1F1D29",
    borderRadius: 20,
    padding: 1,
  },

  imageWrapper: {
    width: "100%",
    height: "50%",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginTop: 30,
  },

  ovalImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },

  bottomContent: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    paddingHorizontal: 25,
    alignItems: "center",
    gap: 30,
  },

  title: {
    color: "#f3f3f3ff",
    fontSize: 28,
    textAlign: "center",
    lineHeight: 34,
    fontWeight: "300",
  },

  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#8d69e0ff",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 22,
    gap: 16,
    width: 240,
    justifyContent: "right",
  },

  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },

  policy: {
    color: "#ffffff9f",
    fontSize: 14,
    textAlign: "center",
    borderBottomWidth: 0.2,
    borderBottomColor: "#ffffff38",
    paddingBottom: 20,
    paddingHorizontal: 10,
  },

  linkText: {
    color: "#ffffffa4",
    fontSize: 16,
    fontWeight: "500",
  },

  popupOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  popupBox: {
    width: 280,
    backgroundColor: "#2a2736",
    padding: 22,
    borderRadius: 14,
    alignItems: "center",
  },

  popupTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },

  popupText: {
    color: "#bbb",
    fontSize: 14,
    marginBottom: 15,
    textAlign: "center",
  },

  popupBtn: {
    backgroundColor: "#7d5df8",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
  },

  popupBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  popupCancel: {
    color: "#bbb",
    fontSize: 14,
    marginTop: 15,
  },
});
