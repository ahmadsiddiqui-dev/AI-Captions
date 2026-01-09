import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Image,
  LayoutAnimation,
  UIManager,
  Platform,
  Animated,
  Modal,
  TouchableOpacity,
  loading,
  Linking,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Clipboard from "@react-native-clipboard/clipboard";
import { launchImageLibrary } from "react-native-image-picker";
import { tryShowRatePopup } from '../src/utils/rateHelper';
import { PermissionsAndroid } from "react-native";
import { getOrCreateDeviceId } from "../src/utils/deviceId";

const AnimatedPressable = ({
  children,
  onPress,
  disabled,
  style,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => {
        Animated.parallel([
          Animated.spring(scale, {
            toValue: 0.97,
            friction: 7,
            tension: 90,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.75,
            duration: 120,
            useNativeDriver: true,
          }),
        ]).start();
      }}
      onPressOut={() => {
        Animated.parallel([
          Animated.spring(scale, {
            toValue: 1,
            friction: 7,
            tension: 90,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 120,
            useNativeDriver: true,
          }),
        ]).start();
      }}
    >
      <Animated.View
        style={[
          { transform: [{ scale }], opacity },
          style,
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
};

/* Android Layout Animation */
if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}
const isBlocked = loading;

const BASE_URL = "https://ai-captions.onrender.com/api/captions";

/* FREE + PREMIUM mood & language DATA */
const FREE_MOODS = ["Auto", "professional", "funny", "romantic", "travel"];
const PREMIUM_MOODS = [
  "Auto",
  "professional",
  "funny",
  "romantic",
  "sad",
  "inspiring",
  "travel",
  "savage",
  "aesthetic",
  "happy",
  "emotional",
  "cinematic",
  "vibes",
  "luxury",
  "cute",
];

// English only for free users
const PREMIUM_LANGUAGES = [
  "English",
  "Arabic",
  "Bengali",
  "Chinese (Simplified)",
  "Chinese (Traditional)",
  "Czech",
  "Danish",
  "Dutch",
  "Estonian",
  "Filipino",
  "Finnish",
  "French",
  "German",
  "Greek",
  "Gujarati",
  "Hausa",
  "Hebrew",
  "Hindi",
  "Hungarian",
  "Icelandic",
  "Igbo",
  "Indonesian",
  "Italian",
  "Japanese",
  "Javanese",
  "Kannada",
  "Korean",
  "Latvian",
  "Lithuanian",
  "Malay",
  "Malayalam",
  "Marathi",
  "Nepali",
  "Norwegian",
  "Persian",
  "Polish",
  "Portuguese",
  "Punjabi",
  "Romanian",
  "Russian",
  "Serbian",
  "Sinhala",
  "Slovak",
  "Slovenian",
  "Somali",
  "Spanish",
  "Swahili",
  "Swedish",
  "Tagalog",
  "Tamil",
  "Telugu",
  "Thai",
  "Turkish",
  "Ukrainian",
  "Urdu",
  "Uzbek",
  "Vietnamese",
  "Xhosa",
  "Yoruba",
  "Zulu"
];

const GLASS_BG = "rgba(255,255,255,0.08)";
const GLASS_BORDER = "rgba(255,255,255,0.15)";
const GLASS_TEXT = "#E5E5EA";
const GLASS_SUBTEXT = "#A1A1A6";

/* Generate Button Animation */
const AIButton = ({ loading, onPress }) => {
  const moveAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (loading) {
      Animated.timing(moveAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      Animated.timing(moveAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      pulseAnim.setValue(1);
    }
  }, [loading]);

  return (
 <Pressable
  onPress={onPress}
  disabled={loading}
  style={({ pressed }) => [
    styles.generateBtn,
    pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] },
    loading && { opacity: 0.6 },
  ]}
>
  <Animated.View
    style={{
      transform: [{ translateX: moveAnim }, { scale: pulseAnim }],
      marginRight: loading ? 0 : 8,
    }}
  >
    <Ionicons name="sparkles" size={22} color="#F5C77A" />
  </Animated.View>

  {!loading && (
    <Text style={styles.generateText}>Generate Captions</Text>
  )}
</Pressable>

  );
};

/* MAIN SCREEN */
const CaptionGeneratorScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();


  /* STATES */
  const initialImages = route.params?.selectedImages ?? [];
  const [images, setImages] = useState(initialImages);
  const [message, setMessage] = useState("");

  const [lengthOption, setLengthOption] = useState("Auto");
  const [moodOption, setMoodOption] = useState("Auto");
  const [emojiCount, setEmojiCount] = useState("Auto");
  const [hashtagCount, setHashtagCount] = useState("Auto");
  const [language, setLanguage] = useState("English");

  const [loading, setLoading] = useState(false);
  const [captions, setCaptions] = useState([]);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(-1);

  const [isPremium, setIsPremium] = useState(false);

  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetType, setSheetType] = useState("");
  const [searchText, setSearchText] = useState("");

  /* Popup for add photo */
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupType, setPopupType] = useState("content");
  const [permissionPopupVisible, setPermissionPopupVisible] = useState(false);
  const permissionDeniedOnceRef = useRef(false);




  /* CHECK PREMIUM */
  useEffect(() => {
    const fetchSub = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) return;

        const res = await fetch("https://ai-captions.onrender.com/api/subscription/status", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (data?.isSubscribed && new Date(data.expiryDate) > new Date()) {
          setIsPremium(true);
        }
      } catch { }
    };

    fetchSub();
  }, []);

  /* IMAGE PICKER */
  const addPhotos = async () => {
    if (images.length >= 5) return;

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

        if (result === PermissionsAndroid.RESULTS.GRANTED) {
          // ok
        } else {
          permissionDeniedOnceRef.current = true;
          return;
        }
      }
    }


    launchImageLibrary(
      {
        selectionLimit: 5 - images.length,
        mediaType: "photo",
      },
      (res) => {
        if (res.didCancel) return;

        if (res.assets) {
          setImages([...images, ...res.assets]);
          LayoutAnimation.easeInEaseOut();
        }
      }
    );
  };


  const removeImage = (index) => {
    const arr = [...images];
    arr.splice(index, 1);
    LayoutAnimation.easeInEaseOut();
    setImages(arr);
  };

  /* COPY */
  const copyToClipboard = (text, index) => {
    Clipboard.setString(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(-1), 2000);
  };

  /* GENERATE */
  const buildOptions = () => ({
    length: lengthOption,
    mood: moodOption,
    emojiCount,
    hashtagCount,
    language,
    message: message.trim(),
  });

  const CAPTION_SUCCESS_COUNT_KEY = "caption_success_count";


  const generateCaptions = async () => {
    if (images.length === 0 && message.trim().length === 0) {
      setPopupVisible(true);
      return;
    }

    setLoading(true);
    setError("");
    setCaptions([]);

    try {
      const token = await AsyncStorage.getItem("token");
      const deviceId = await getOrCreateDeviceId();

      let headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const form = new FormData();

      form.append("deviceId", String(deviceId));

      images.forEach((img, i) => {
        form.append("images", {
          uri: img.uri,
          name: img.fileName || `photo_${i}.jpg`,
          type: img.type || "image/jpeg",
        });
      });

      form.append("options", JSON.stringify(buildOptions()));

      const res = await fetch(`${BASE_URL}/generate-captions`, {
        method: "POST",
        headers,
        body: form,
      });

      const data = await res.json();

      if (data.requireSubscription) {
        navigation.navigate("Subscription");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError(data?.message || "Failed to generate caption");
        setLoading(false);
        return;
      }

      const freeUsed = Number(await AsyncStorage.getItem("freeCaptionCount")) || 0;
      await AsyncStorage.setItem("freeCaptionCount", String(freeUsed + 1));

      setCaptions(data.captions);
      if (images.length > 0) setImages([]);

      //  RATE APP LOGIC
      const successCount =
        Number(await AsyncStorage.getItem(CAPTION_SUCCESS_COUNT_KEY)) || 0;

      const newCount = successCount + 1;
      await AsyncStorage.setItem(
        CAPTION_SUCCESS_COUNT_KEY,
        newCount.toString()
      );

      // Show rating popup after 3 successful generations
      if (newCount === 3) {
        setTimeout(() => {
          tryShowRatePopup();
        }, 1500);
      }

    } catch (err) {
      console.log("FRONTEND ERROR:", err);
      setError(err?.message || "Server error");
    }

    setLoading(false);
  };

  /* SHEET */
  const openSheet = (type) => {
    setSheetType(type);
    setSheetVisible(true);
    setSearchText("");
  };

  const closeSheet = () => {
    setSheetVisible(false);
    setSheetType("");
    setSearchText("");
  };

  const filteredMoodList = () => {
    const list = isPremium ? PREMIUM_MOODS : FREE_MOODS;
    return list.filter((m) => m.toLowerCase().includes(searchText.toLowerCase()));
  };

  const filteredLanguageList = () => {
    const list = isPremium ? PREMIUM_LANGUAGES : ["English"];
    return list.filter((l) => l.toLowerCase().includes(searchText.toLowerCase()));
  };

  /* RENDER SHEET */
  const renderSheet = () => {
    if (!sheetVisible) return null;

    let title = "";
    let options = [];

    if (sheetType === "mood") {
      title = "Select Mood";
      options = filteredMoodList();
    }

    if (sheetType === "language") {
      title = "Select Language";
      options = filteredLanguageList();
    }

    if (sheetType === "emoji") {
      title = "Emojis";
      options = ["Auto", "Off", 1, 2, 3, 4, 5];
    }

    if (sheetType === "hashtag") {
      title = "Hashtags";
      options = ["Auto", "Off", 3, 5, 8, 10];
    }

    if (sheetType === "length") {
      title = "Caption Length";
      options = ["Auto", "short", "medium", "long"];
    }

    const handleSelect = (value) => {
      if (loading) return;
      if (sheetType === "mood") setMoodOption(value);
      if (sheetType === "language") setLanguage(value);
      if (sheetType === "emoji") setEmojiCount(value);
      if (sheetType === "hashtag") setHashtagCount(value);
      if (sheetType === "length") setLengthOption(value);

      closeSheet();
    };

    return (
      <Modal visible transparent animationType="none">
        {/* Close when tapping outside */}
        <TouchableOpacity
          style={styles.sheetOverlay}
          activeOpacity={1}
          onPress={closeSheet}
        />

        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>{title}</Text>

          {/* Search bar only for mood & language */}
          {(sheetType === "mood" || sheetType === "language") && (
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color="#aaa" />
              <TextInput
                placeholder="Search..."
                placeholderTextColor="#777"
                style={styles.searchInput}
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>
          )}

          {/* OPTIONS LIST */}
          <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
            {options.map((o, i) => {
              const isSelected =
                (sheetType === "mood" && o === moodOption) ||
                (sheetType === "language" && o === language) ||
                (sheetType === "emoji" && o === emojiCount) ||
                (sheetType === "hashtag" && o === hashtagCount) ||
                (sheetType === "length" && o === lengthOption);

              return (
                <Pressable
                  key={i}
                  style={styles.sheetItem}
                  onPress={() => handleSelect(o)}
                >
                  <Text
                    style={[
                      styles.sheetItemText,
                      isSelected && { color: "#F5C77A", fontWeight: "600" }
                    ]}
                  >
                    {o}
                  </Text>

                  {isSelected && (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color="#F5C77A"
                      style={styles.checkIcon}
                    />
                  )}
                </Pressable>
              );
            })}


            {/* Only show Unlock All for FREE users (NOT for emoji/hashtag/length) */}
            {!isPremium &&
              sheetType !== "emoji" &&
              sheetType !== "hashtag" &&
              sheetType !== "length" && (
                <Pressable
                  style={styles.unlockItem}
                  onPress={() => {
                    closeSheet();
                    navigation.navigate("Subscription");
                  }}
                >
                  <Ionicons name="lock-open" size={18} color="#F5C77A" />
                  <Text style={styles.unlockText}>Unlock all options</Text>
                </Pressable>
              )}
          </ScrollView>
        </View>
      </Modal>
    );

  };

  /* MAIN UI */
  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable style={styles.backbutton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#7c7a7aff" />
          <Text style={styles.headerTitle}>Back</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* PHOTOS */}
        <Text style={styles.labelp}>Photos</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageRow}>
          <AnimatedPressable
            disabled={loading || images.length >= 5}
            onPress={() => {
              if (loading || images.length >= 5) return;
              addPhotos();
            }}
          >
            <View style={styles.addBox}>
              <Ionicons name="add" size={32} color="#F5C77A" />
            </View>
          </AnimatedPressable>



          {images.map((img, i) => (
            <View key={i} style={styles.imageBox}>
              <Image source={{ uri: img.uri }} style={styles.image} />
              <Pressable
                style={styles.removeBtn}
                onPress={() => {
                  if (loading) return;
                  removeImage(i);
                }}
              >
                <Ionicons name="close" size={16} color="white" />
              </Pressable>

            </View>
          ))}
        </ScrollView>

        {/* MESSAGE */}
        <Text style={styles.label}>Message</Text>
        <Text style={styles.labelm}>This helps us come up with relevant captions</Text>

        <View>
          <TextInput
            placeholder="Describe your photo..."
            placeholderTextColor="#777"
            value={message}
            onChangeText={setMessage}
            style={styles.input}
            multiline
            editable={!loading}
          />
          <View style={styles.inputSeparator} />
        </View>



        {/* CAPTIONS */}
        {captions.map((c, idx) => (
          <View key={idx} style={styles.captionCard}>
            <Text style={styles.captionTitle}>Caption {idx + 1}</Text>
            <Text style={styles.captionText}>{c.text}</Text>

            <Pressable
              style={({ pressed }) => [
                styles.copyBtn,
                copiedIndex === idx && {
                  backgroundColor: "rgba(245,199,122,0.25)",
                  borderColor: "#F5C77A",
                },
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => copyToClipboard(c.text, idx)}
            >
              <Ionicons name={copiedIndex === idx ? "checkmark" : "copy-outline"} size={18} color="#F5C77A" />
              <Text style={styles.copyText}>{copiedIndex === idx ? "Copied" : "Copy"}</Text>
            </Pressable>
          </View>
        ))}

        {/* CUSTOMIZE */}
        <Text style={styles.customizeTitle}>Customize (Optional)</Text>

        {/* ROWS */}
      <AnimatedPressable
  disabled={loading}
  onPress={() => {
    if (loading) return;
    openSheet("length");
  }}
>
  <View style={styles.rowCard}>
    <Text style={styles.rowLeft}>Caption Length</Text>
    <View style={styles.rowRightBox}>
      <Text style={styles.rowRight}>{lengthOption}</Text>
      <Ionicons name="chevron-forward" size={18} color="#777" />
    </View>
  </View>
</AnimatedPressable>

   <AnimatedPressable
  disabled={loading}
  onPress={() => {
    if (loading) return;
    openSheet("mood");
  }}
>
  <View style={styles.rowCard}>
    <Text style={styles.rowLeft}>Mood</Text>
    <View style={styles.rowRightBox}>
      <Text style={styles.rowRight}>{moodOption}</Text>
      <Ionicons name="chevron-forward" size={18} color="#777" />
    </View>
  </View>
</AnimatedPressable>


    <AnimatedPressable
  disabled={loading}
  onPress={() => {
    if (loading) return;
    openSheet("emoji");
  }}
>
  <View style={styles.rowCard}>
    <Text style={styles.rowLeft}>Emojis</Text>
    <View style={styles.rowRightBox}>
      <Text style={styles.rowRight}>{String(emojiCount)}</Text>
      <Ionicons name="chevron-forward" size={18} color="#777" />
    </View>
  </View>
</AnimatedPressable>

     <AnimatedPressable
  disabled={loading}
  onPress={() => {
    if (loading) return;
    openSheet("hashtag");
  }}
>
  <View style={styles.rowCard}>
    <Text style={styles.rowLeft}>Hashtags</Text>
    <View style={styles.rowRightBox}>
      <Text style={styles.rowRight}>{String(hashtagCount)}</Text>
      <Ionicons name="chevron-forward" size={18} color="#777" />
    </View>
  </View>
</AnimatedPressable>


      <AnimatedPressable
  disabled={loading}
  onPress={() => {
    if (loading) return;
    openSheet("language");
  }}
>
  <View style={styles.rowCard}>
    <Text style={styles.rowLeft}>Language</Text>
    <View style={styles.rowRightBox}>
      <Text style={styles.rowRight}>{language}</Text>
      <Ionicons name="chevron-forward" size={18} color="#777" />
    </View>
  </View>
</AnimatedPressable>


        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* GENERATE BUTTON */}
      <View style={[styles.gnrbtn, { bottom: 25 + insets.bottom }]}>
        <AIButton loading={loading} onPress={generateCaptions} />
      </View>


      {/* BOTTOM SHEET */}
      {renderSheet()}

      {/* PHOTO POPUP */}
      <Modal visible={popupVisible} transparent animationType="fade">
        <Pressable
          style={styles.popupOverlay}
          onPress={() => setPopupVisible(false)}
        >
          <Pressable
            style={styles.popupBox}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.popupTitle}>Content Required</Text>
            <Text style={styles.popupText}>
              Please add at least one photo or description to generate a caption.
            </Text>

            <Pressable
              style={styles.popupBtn}
              onPress={() => {
                setPopupVisible(false);
                addPhotos();
              }}
            >
              <Text style={styles.popupBtnText}>Add Photo</Text>
            </Pressable>

            <Pressable onPress={() => setPopupVisible(false)}>
              <Text style={styles.popupCancel}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

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
              Please allow photo access from settings to add photos.
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

export default CaptionGeneratorScreen;

/* STYLES */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#141414ff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#292929ff",
  },

  backbutton: { flexDirection: "row", alignItems: "center" },

  headerTitle: {
    color: "#7c7a7aff",
    marginLeft: 1,
    fontSize: 15,
    fontWeight: "400",
  },

  scroll: { padding: 16 },

  /* PHOTOS */
  imageRow: { flexDirection: "row", marginBottom: 6 },

  addBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  imageBox: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginRight: 10,
    overflow: "hidden",
    position: "relative",
  },

  image: { width: "100%", height: "100%" },

  removeBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.55)",
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  /* LABELS */
  labelp: { color: "#dbd8d8ff", marginBottom: 6, fontSize: 15, fontWeight: "600" },
  labelm: { color: "#7c7b7bff", marginBottom: 6, fontSize: 13 },
  label: { color: "#dbd8d8ff", marginTop: 14, marginBottom: 6, fontSize: 15, fontWeight: "600" },

  /* INPUT */
  input: {
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    padding: 14,
    borderRadius: 14,
    color: GLASS_TEXT,
    minHeight: 55,
  },


  /* CAPTION CARDS */
  captionCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: 16,
    marginTop: 30,

    borderWidth: 1,
    borderColor: GLASS_BORDER
  },


  captionTitle: {
    color: "#A1A1A6",
    marginBottom: 6,
    fontSize: 13,
    fontWeight: "500",
  },

  captionText: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 22,
  },


  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,

    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginTop: 14,
    width: "38%",
  },


  copyText: {
    color: "#F5C77A",
    marginLeft: 8,
    fontWeight: "700",
  },

  /* CUSTOMIZE */
  customizeTitle: {
    color: "#dbd8d8ff",
    marginTop: 25,
    marginBottom: 20,
    fontSize: 15,
    fontWeight: "600",
  },

  rowCard: {
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },


  rowLeft: {
    color: GLASS_TEXT,
    fontSize: 14,
  },

  rowRight: {
    color: "#F5C77A",
    fontSize: 14,
    fontWeight: "600",
  },


  rowRightBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  /* SHEET */
  sheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },

sheet: {
  backgroundColor: "rgba(30,30,30,0.92)",
  borderTopLeftRadius: 22,
  borderTopRightRadius: 22,

  borderTopWidth: 1,
  borderLeftWidth: 1,
  borderRightWidth: 1,
  borderBottomWidth: 0,

  borderColor: GLASS_BORDER,
  padding: 20,
},


  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    marginBottom: 10,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",

    paddingHorizontal: 12,
    paddingVertical: 0,
    borderRadius: 14,
    marginVertical: 10,
  },

  searchInput: {
    color: "white",
    marginLeft: 10,
    paddingVertical: 8,
    flex: 1,
  },

  sheetItem: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
  },

  checkIcon: {
    position: "absolute",
    right: 10,
    top: "50%",
  },

  sheetItemText: {
    color: GLASS_TEXT,
    fontSize: 15,
  },


  unlockItem: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    gap: 6,
  },

  unlockText: {
    color: "#F5C77A",
    fontWeight: "700",
    fontSize: 15,
    textAlign: "center",
  },


  /* ERRORS */
  error: { color: "#ff5c5c", marginTop: 10, textAlign: "center" },

  /* GENERATE BUTTON */
  generateBtn: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "rgba(255,255,255,0.08)",
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 16,
    gap: 6,
    width: "fitcontent",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",

    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },


  generateText: { color: "#F5C77A", fontSize: 16 },

  /* POPUP */
  popupOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  popupBox: {
    width: 280,
    backgroundColor: "rgba(30,30,30,0.92)",
    borderRadius: 18,
    padding: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },

  popupTitle: {
    color: GLASS_TEXT,
    fontSize: 20,
    fontWeight: "700",
  },


  popupText: {
    color: GLASS_SUBTEXT,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 15
  },

  popupBtn: {
    backgroundColor: "rgba(245,199,122,0.12)",
    borderWidth: 1,
    borderColor: "rgba(245,199,122,0.35)",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 14,
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
  inputSeparator: {
    height: 2,
    backgroundColor: GLASS_BORDER,
    marginTop: 20,
    marginBottom: 0,
  },
  gnrbtn: {
    position: "absolute",
    bottom: 25,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },


});
