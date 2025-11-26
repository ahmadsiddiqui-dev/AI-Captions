import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  LayoutAnimation,
  UIManager,
  Platform,
  Dimensions,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Clipboard from "@react-native-clipboard/clipboard";
import { launchImageLibrary } from "react-native-image-picker";

// Enable smooth animation on Android
if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const BASE_URL = "http://10.0.1.7:8000/api/captions";

const LANGUAGES = ["English", "Spanish", "Hindi", "Arabic", "French"];

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = Math.min(360, SCREEN_WIDTH - 64); // responsive card size
const CARD_HEIGHT = Math.round(CARD_WIDTH * 0.7);

const CaptionGeneratorScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const initialImages = route.params?.selectedImages ?? [];
  const [images, setImages] = useState(initialImages);

  const [message, setMessage] = useState("");
  const [lengthOption, setLengthOption] = useState("medium");
  const [moodOption, setMoodOption] = useState("neutral");

  const [useEmoji, setUseEmoji] = useState(true);
  const [emojiCount, setEmojiCount] = useState(1);

  const [useHashtags, setUseHashtags] = useState(true);
  const [hashtagCount, setHashtagCount] = useState(3);

  const [language, setLanguage] = useState("English");
  const [langOpen, setLangOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [captions, setCaptions] = useState([]);
  const [error, setError] = useState("");

  const [copiedIndex, setCopiedIndex] = useState(-1);

  // ---------------- PICK IMAGES ----------------
  const addPhotos = () => {
    if (images.length >= 5) return;
    launchImageLibrary(
      {
        selectionLimit: 5 - images.length,
        mediaType: "photo",
      },
      (res) => {
        if (res.assets) {
          setImages([...images, ...res.assets]);
          LayoutAnimation.easeInEaseOut();
        }
      }
    );
  };

  const removeImage = (index) => {
    const updated = [...images];
    updated.splice(index, 1);
    LayoutAnimation.easeInEaseOut();
    setImages(updated);
  };

  const copyToClipboard = (text, index) => {
    Clipboard.setString(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(-1), 2000);
  };

  const buildOptions = () => ({
    length: lengthOption,
    mood: moodOption,
    useEmoji,
    emojiCount,
    useHashtags,
    hashtagCount,
    language,
    message: message.trim(),
  });

  // ---------------- GENERATE CAPTIONS ----------------
  const generateCaptions = async () => {
    // NEW LOGIC ✔
    if (images.length === 0 && message.trim().length === 0) {
      setError("Please add a photo or write a message to generate a caption.");
      return;
    }

    setLoading(true);
    setError("");
    setCaptions([]);

    try {
      const token = await AsyncStorage.getItem("token");
      const form = new FormData();

      if (images.length > 0) {
        images.forEach((img, idx) => {
          form.append("images", {
            uri: img.uri,
            name: img.fileName || `photo_${idx}.jpg`,
            type: img.type || "image/jpeg",
          });
        });
      }

      form.append("options", JSON.stringify(buildOptions()));

      const res = await fetch(`${BASE_URL}/generate-captions`, {
        method: "POST",
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Failed to generate caption");
        setLoading(false);
        return;
      }

      const final = [];
      final.push(data.captions[0] || { text: "" });
      final.push(data.captions[1] || data.captions[0] || { text: "" });

      setCaptions(final);

      if (images.length > 0) setImages([]);

      setLoading(false);
    } catch (err) {
      setError("Server error");
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="white" />
        </Pressable>
        <Text style={styles.headerTitle}>Caption Generator</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Image Row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageRow}>

          {/* + Add Button */}
          <Pressable style={styles.addBox} onPress={addPhotos}>
            <Ionicons name="add" size={32} color="white" />
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

        {/* Message */}
        <Text style={styles.label}>Message (optional)</Text>
        <TextInput
          placeholder="Describe your photo..."
          placeholderTextColor="#777"
          value={message}
          onChangeText={setMessage}
          style={styles.input}
          multiline
        />

        {/* Length */}
        <Text style={styles.label}>Caption Length</Text>
        <View style={styles.rowWrap}>
          {["short", "medium", "long"].map((v) => (
            <Pressable
              key={v}
              onPress={() => setLengthOption(v)}
              style={[styles.pill, lengthOption === v && styles.pillActive]}
            >
              <Text style={lengthOption === v ? styles.textActive : styles.textInactive}>
                {v}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Mood */}
        <Text style={styles.label}>Caption Mood</Text>
        <View style={styles.rowWrap}>
          {["neutral", "funny", "romantic", "professional", "sad"].map((v) => (
            <Pressable
              key={v}
              onPress={() => setMoodOption(v)}
              style={[styles.pill, moodOption === v && styles.pillActive]}
            >
              <Text style={moodOption === v ? styles.textActive : styles.textInactive}>
                {v}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Emojis */}
        <Text style={styles.label}>Emojis</Text>
        <View style={styles.rowBetween}>
          <Pressable onPress={() => setUseEmoji(!useEmoji)}>
            <Text style={{ color: useEmoji ? "#7da8ff" : "#777" }}>
              {useEmoji ? "Enabled" : "Disabled"}
            </Text>
          </Pressable>

          {useEmoji && (
            <View style={styles.counter}>
              <Pressable onPress={() => setEmojiCount(Math.max(0, emojiCount - 1))}>
                <Ionicons name="remove-circle-outline" size={22} color="#7da8ff" />
              </Pressable>
              <Text style={styles.counterText}>{emojiCount}</Text>
              <Pressable onPress={() => setEmojiCount(Math.min(5, emojiCount + 1))}>
                <Ionicons name="add-circle-outline" size={22} color="#7da8ff" />
              </Pressable>
            </View>
          )}
        </View>

        {/* Hashtags */}
        <Text style={styles.label}>Hashtags</Text>
        <View style={styles.rowBetween}>
          <Pressable onPress={() => setUseHashtags(!useHashtags)}>
            <Text style={{ color: useHashtags ? "#7da8ff" : "#777" }}>
              {useHashtags ? "Enabled" : "Disabled"}
            </Text>
          </Pressable>

          {useHashtags && (
            <View style={styles.counter}>
              <Pressable onPress={() => setHashtagCount(Math.max(0, hashtagCount - 1))}>
                <Ionicons name="remove-circle-outline" size={22} color="#7da8ff" />
              </Pressable>
              <Text style={styles.counterText}>{hashtagCount}</Text>
              <Pressable onPress={() => setHashtagCount(Math.min(10, hashtagCount + 1))}>
                <Ionicons name="add-circle-outline" size={22} color="#7da8ff" />
              </Pressable>
            </View>
          )}
        </View>

        {/* Language Dropdown */}
        <Text style={styles.label}>Language</Text>
        <Pressable
          style={styles.dropdown}
          onPress={() => {
            LayoutAnimation.easeInEaseOut();
            setLangOpen(!langOpen);
          }}
        >
          <Text style={styles.dropdownText}>{language}</Text>
          <Ionicons name={langOpen ? "chevron-up" : "chevron-down"} size={18} color="#aaa" />
        </Pressable>

        {langOpen && (
          <View style={styles.dropdownList}>
            {LANGUAGES.map((lang) => (
              <Pressable
                key={lang}
                style={styles.dropdownItem}
                onPress={() => {
                  LayoutAnimation.easeInEaseOut();
                  setLanguage(lang);
                  setLangOpen(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{lang}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Generate Button */}
        <Pressable style={styles.generateBtn} onPress={generateCaptions} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="sparkles" size={25} color="white" />
              <Text style={styles.generateText}> Generate Captions</Text>
            </>
          )}
        </Pressable>

        {/* Errors */}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Captions - HORIZONTAL CARDS */}
        {captions.length > 0 && (
          <View style={styles.cardsWrapper}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardsScroll}
            >
              {captions.map((c, idx) => (
                <View key={idx} style={[styles.captionCard, { width: CARD_WIDTH, height: CARD_HEIGHT }]}>
                  <View style={styles.cardInner}>
                    <Text style={styles.captionTitle}>Caption {idx + 1}</Text>
                    <Text style={styles.captionText} numberOfLines={10}>
                      {c.text}
                    </Text>
                  </View>

                  <View style={styles.cardFooter}>
                    <Pressable
                      style={[
                        styles.copyBtn,
                        copiedIndex === idx && { backgroundColor: "#4caf50" },
                      ]}
                      onPress={() => copyToClipboard(c.text, idx)}
                    >
                      <Ionicons
                        name={copiedIndex === idx ? "checkmark" : "copy-outline"}
                        size={18}
                        color="white"
                      />
                      <Text style={styles.copyText}>
                        {copiedIndex === idx ? " Copied" : " Copy"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default CaptionGeneratorScreen;

/* -------------------------------- STYLES BELOW -------------------------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomColor: "#222",
    borderBottomWidth: 0.3,
  },

  headerTitle: { color: "white", marginLeft: 10, fontSize: 18, fontWeight: "600" },

  scroll: { padding: 16 },

  imageRow: { flexDirection: "row", marginBottom: 10 },

  addBox: {
    width: 90,
    height: 90,
    backgroundColor: "#222",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    borderColor: "#444",
    borderWidth: 1,
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

  label: { color: "#aaa", marginTop: 14, marginBottom: 6 },

  input: {
    backgroundColor: "#1a1a1a",
    padding: 12,
    borderRadius: 12,
    color: "white",
    minHeight: 70,
  },

  rowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },

  pill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#111",
    borderRadius: 18,
  },
  pillActive: { backgroundColor: "#7da8ff" },
  textActive: { color: "white" },
  textInactive: { color: "#999" },

  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },

  counter: { flexDirection: "row", alignItems: "center" },

  counterText: { color: "white", fontSize: 16, marginHorizontal: 10 },

  dropdown: {
    backgroundColor: "#1a1a1a",
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dropdownText: { color: "white", fontSize: 16 },

  dropdownList: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 5,
  },
  dropdownItem: { padding: 12 },
  dropdownItemText: { color: "white" },

  generateBtn: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#8d69e0",
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 20,
  },
  generateText: { color: "white", fontSize: 16 },

  error: { color: "#ff5c5c", marginTop: 10, textAlign: "center" },

  /* Cards wrapper */
  cardsWrapper: {
    marginTop: 18,
  },
  cardsScroll: {
    paddingHorizontal: 16,
    // keeps cards centered
    alignItems: "center",
  },

  captionCard: {
    backgroundColor: "#121212",
    padding: 16,
    borderRadius: 14,
    marginRight: 14,
    // shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    // elevation for Android
    elevation: 6,
    justifyContent: "space-between",
  },

  cardInner: {
    flex: 1,
  },

  captionTitle: { color: "#bbb", marginBottom: 8, fontSize: 13 },

  captionText: { color: "white", fontSize: 16, lineHeight: 22 },

  cardFooter: {
    marginTop: 12,
    alignItems: "flex-start",
  },

  copyBtn: {
    flexDirection: "row",
    backgroundColor: "#7da8ff",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  copyText: { color: "white", marginLeft: 8, fontWeight: "600" },
});
