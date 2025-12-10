import React, { useRef, useEffect } from "react";
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
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { launchImageLibrary } from "react-native-image-picker";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage"; 

const HomeScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  //  Auto-popup subscription on first app open only
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      const isSubscribed = await AsyncStorage.getItem("subscribed");
      if (!isSubscribed) {
        navigation.navigate("Subscription");
      }
    };
    checkSubscriptionStatus();
  }, []);

  const requestGalleryPermission = async () => {
    try {
      if (Platform.OS === "android") {
        if (Platform.Version >= 33) {
          return await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          );
        }
        return await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const pickImage = async () => {
    const granted = await requestGalleryPermission();
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;

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

      {/* SETTINGS ICON */}
      <View style={[styles.topRight, { top: insets.top + 10 }]}>
        <Pressable onPress={() => navigation.push("Settings")}>
          <Ionicons name="cog-outline" size={30} color="#b3b1b1ff" />
        </Pressable>
      </View>

      {/* IMAGE SPACE */}
      <View style={styles.imageWrapper}>
        <Image
          style={styles.ovalImage}
          source={require("../src/images/img1.png")}
        />
      </View>

      {/* BOTTOM CONTENT */}
      <View style={styles.bottomContent}>
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
});
