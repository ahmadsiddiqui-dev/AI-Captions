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
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Clipboard from "@react-native-clipboard/clipboard";
import { launchImageLibrary } from "react-native-image-picker";
import DeviceInfo from "react-native-device-info";
import { tryShowRatePopup } from '../src/utils/rateHelper';


/* Android Layout Animation */
if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
    <Pressable onPress={onPress} disabled={loading} style={styles.generateBtn}>
      <Animated.View
        style={{ transform: [{ translateX: moveAnim }, { scale: pulseAnim }] }}
      >
        <Ionicons name="sparkles" size={25} color="white" />
      </Animated.View>

      {!loading && <Text style={styles.generateText}> Generate Captions</Text>}
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
  const addPhotos = () => {
    launchImageLibrary({ selectionLimit: 5 - images.length, mediaType: "photo" }, (res) => {
      if (res.assets) {
        setImages([...images, ...res.assets]);
        LayoutAnimation.easeInEaseOut();
      }
    });
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

      let headers = {};
      if (!token) {
        headers["x-device-id"] = DeviceInfo.getUniqueId();
      } else {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const form = new FormData();
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

    } catch {
      setError("Server error");
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
                      isSelected && { color: "#7d5df8", fontWeight: "600" }
                    ]}
                  >
                    {o}
                  </Text>

                  {isSelected && (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color="#7d5df8"
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
                  <Ionicons name="lock-open" size={18} color="#7d5df8" />
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
          <Pressable style={styles.addBox} onPress={addPhotos}>
            <Ionicons name="add" size={32} color="#134885ff" />
          </Pressable>

          {images.map((img, i) => (
            <View key={i} style={styles.imageBox}>
              <Image source={{ uri: img.uri }} style={styles.image} />
              <Pressable style={styles.removeBtn} onPress={() => removeImage(i)}>
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
          />
          <View style={styles.inputSeparator} />
        </View>


        {/* CAPTIONS */}
        {captions.map((c, idx) => (
          <View key={idx} style={styles.captionCard}>
            <Text style={styles.captionTitle}>Caption {idx + 1}</Text>
            <Text style={styles.captionText}>{c.text}</Text>

            <Pressable
              style={[styles.copyBtn, copiedIndex === idx && { backgroundColor: "#4caf50" }]}
              onPress={() => copyToClipboard(c.text, idx)}
            >
              <Ionicons name={copiedIndex === idx ? "checkmark" : "copy-outline"} size={18} color="white" />
              <Text style={styles.copyText}>{copiedIndex === idx ? "Copied" : "Copy"}</Text>
            </Pressable>
          </View>
        ))}

        {/* CUSTOMIZE */}
        <Text style={styles.customizeTitle}>Customize (Optional)</Text>

        {/* ROWS */}
        <Pressable style={styles.rowCard} onPress={() => openSheet("length")}>
          <Text style={styles.rowLeft}>Caption Length</Text>
          <View style={styles.rowRightBox}>
            <Text style={styles.rowRight}>{lengthOption}</Text>
            <Ionicons name="chevron-forward" size={18} color="#777" />
          </View>
        </Pressable>

        <Pressable style={styles.rowCard} onPress={() => openSheet("mood")}>
          <Text style={styles.rowLeft}>Mood</Text>
          <View style={styles.rowRightBox}>
            <Text style={styles.rowRight}>{moodOption}</Text>
            <Ionicons name="chevron-forward" size={18} color="#777" />
          </View>
        </Pressable>

        <Pressable style={styles.rowCard} onPress={() => openSheet("emoji")}>
          <Text style={styles.rowLeft}>Emojis</Text>
          <View style={styles.rowRightBox}>
            <Text style={styles.rowRight}>{String(emojiCount)}</Text>
            <Ionicons name="chevron-forward" size={18} color="#777" />
          </View>
        </Pressable>

        <Pressable style={styles.rowCard} onPress={() => openSheet("hashtag")}>
          <Text style={styles.rowLeft}>Hashtags</Text>
          <View style={styles.rowRightBox}>
            <Text style={styles.rowRight}>{String(hashtagCount)}</Text>
            <Ionicons name="chevron-forward" size={18} color="#777" />
          </View>
        </Pressable>

        <Pressable style={styles.rowCard} onPress={() => openSheet("language")}>
          <Text style={styles.rowLeft}>Language</Text>
          <View style={styles.rowRightBox}>
            <Text style={styles.rowRight}>{language}</Text>
            <Ionicons name="chevron-forward" size={18} color="#777" />
          </View>
        </Pressable>

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
        <View style={styles.popupOverlay}>
          <View style={styles.popupBox}>
            <Text style={styles.popupTitle}>Photo Required</Text>
            <Text style={styles.popupText}>
              Please add at least one photo or description.
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
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CaptionGeneratorScreen;

/* STYLES */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a1822ff" },

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
    backgroundColor: "#1F1D29",
    borderRadius: 10,
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
    backgroundColor: "#1F1D29",
    padding: 12,
    borderRadius: 12,
    color: "white",
    minHeight: 55,
    marginBottom: 10,
  },

  /* CAPTION CARDS */
  captionCard: {
    backgroundColor: "#23212FFF",
    borderRadius: 12,
    padding: 15,
    marginTop: 30,
    borderWidth: 1,
    borderColor: "#7d5df8",
  },

  captionTitle: { color: "#CFCED6", marginBottom: 6, fontSize: 14 },
  captionText: { color: "white", fontSize: 15, lineHeight: 22 },

  copyBtn: {
    flexDirection: "row",
    backgroundColor: "#8d69e0",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
    width: "35%",
  },

  copyText: { color: "white", marginLeft: 8, fontWeight: "600" },

  /* CUSTOMIZE */
  customizeTitle: {
    color: "#dbd8d8ff",
    marginTop: 25,
    marginBottom: 20,
    fontSize: 15,
    fontWeight: "600",
  },

  rowCard: {
    backgroundColor: "#1F1D29",
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  rowLeft: { color: "#dbd8d8ff", fontSize: 14 },

  rowRightBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  rowRight: {
    color: "#7d5df8",
    fontSize: 14,
    fontWeight: "600",
  },

  /* SHEET */
  sheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  sheet: {
    backgroundColor: "#1F1D29",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
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
    backgroundColor: "#2b2836",
    paddingHorizontal: 10,
    borderRadius: 10,
    marginVertical: 10,
  },

  searchInput: {
    color: "white",
    marginLeft: 10,
    paddingVertical: 8,
    flex: 1,
  },

  sheetItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#2b2836",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  checkIcon: {
    position: "absolute",
    right: 10,
  },

  sheetItemText: { color: "white", fontSize: 15, textAlign: "center" },

  unlockItem: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    gap: 6,
  },

  unlockText: {
    color: "#7d5df8",
    fontWeight: "700",
    fontSize: 15,
    textAlign: "center",
  },


  /* ERRORS */
  error: { color: "#ff5c5c", marginTop: 10, textAlign: "center" },

  /* GENERATE BUTTON */
  gnrbtn: {
    position: "absolute",
    bottom: 25,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  generateBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#8d69e0",
    paddingVertical: 12,
    paddingHorizontal: 35,
    borderRadius: 14,
    gap: 3,
  },

  generateText: { color: "white", fontSize: 16 },

  /* POPUP */
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
  inputSeparator: {
    height: 2,
    backgroundColor: "#2b2836",
    marginTop: 20,
    marginBottom: 0,
  },

});
