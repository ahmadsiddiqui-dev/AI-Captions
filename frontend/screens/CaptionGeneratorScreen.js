import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  LayoutAnimation,
  UIManager,
  Platform,
  Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Clipboard from "@react-native-clipboard/clipboard";
import { launchImageLibrary } from "react-native-image-picker";

// Enable smooth animation
if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const BASE_URL = "https://ai-captions.onrender.com/api/captions";

const LANGUAGES = ["English", "Spanish", "Hindi", "Arabic", "French"];

const CaptionGeneratorScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const initialImages = route.params?.selectedImages ?? [];
  const [images, setImages] = useState(initialImages);

  const [message, setMessage] = useState("");
  const [lengthOption, setLengthOption] = useState("Auto");
  const [moodOption, setMoodOption] = useState("Auto");

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

  const addPhotos = () => {
    if (images.length >= 5) return;
    launchImageLibrary(
      { selectionLimit: 5 - images.length, mediaType: "photo" },
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

  const generateCaptions = async () => {
    if (images.length === 0 && message.trim().length === 0) {
      alert("Please add a photo or write a message to generate a caption.");
      return;
    }

    setLoading(true);
    setError("");
    setCaptions([]);

    try {
      const token = await AsyncStorage.getItem("token");
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
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Failed to generate caption");
        setLoading(false);
        return;
      }

      setCaptions(data.captions);
      images.length > 0 && setImages([]);
    } catch {
      setError("Server error");
    }

    setLoading(false);
  };

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
        {/* IMAGES */}
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
        <TextInput
          placeholder="Describe your photo..."
          placeholderTextColor="#777"
          value={message}
          onChangeText={setMessage}
          style={styles.input}
          multiline
        />

        {/* CAPTIONS (unchanged) */}
        {captions.length > 0 &&
          captions.map((c, idx) => (
            <View key={idx} style={styles.captionCard}>
              <Text style={styles.captionTitle}>Caption {idx + 1}</Text>
              <Text style={styles.captionText}>{c.text}</Text>
              <Pressable
                style={[styles.copyBtn, copiedIndex === idx && { backgroundColor: "#4caf50" }]}
                onPress={() => copyToClipboard(c.text, idx)}
              >
                <Ionicons
                  name={copiedIndex === idx ? "checkmark" : "copy-outline"}
                  size={18}
                  color="white"
                />
                <Text style={styles.copyText}>
                  {copiedIndex === idx ? "Copied" : "Copy"}
                </Text>
              </Pressable>
            </View>
          ))}

        {/* LENGTH */}
        <Text style={styles.label}>Caption Length</Text>
        <View style={styles.rowWrap}>
          {["Auto", "short", "medium", "long"].map((v) => (
            <Pressable
              key={v}
              onPress={() => setLengthOption(v)}
              style={[styles.pill, lengthOption === v && styles.pillActive]}
            >
              <Text style={lengthOption === v ? styles.textActive : styles.textInactive}>{v}</Text>
            </Pressable>
          ))}
        </View>

        {/* MOOD */}
        <Text style={styles.label}>Mood</Text>
        <View style={styles.rowWrap}>
          {[
            "Auto",
            "professional",
            "funny",
            "romantic",
            "sad",
            "inspiring",
            "travel",
            "savage",
            "aesthetic",
          ].map((v) => (
            <Pressable
              key={v}
              onPress={() => setMoodOption(v)}
              style={[styles.pill, moodOption === v && styles.pillActive]}
            >
              <Text style={moodOption === v ? styles.textActive : styles.textInactive}>{v}</Text>
            </Pressable>
          ))}
        </View>

        {/* EMOJI */}
        <Text style={styles.label}>Emojis</Text>
        <View style={styles.rowWrap}>
          {[1, 2, 3, 4, 5].map((v) => (
            <Pressable
              key={v}
              onPress={() => {
                setUseEmoji(true);
                setEmojiCount(v);
              }}
              style={[styles.pill, useEmoji && emojiCount === v && styles.pillActive]}
            >
              <Text style={useEmoji && emojiCount === v ? styles.textActive : styles.textInactive}>
                {v}
              </Text>
            </Pressable>
          ))}
          <Pressable onPress={() => setUseEmoji(false)}
            style={[styles.pill, !useEmoji && styles.pillActive]}>
            <Text style={!useEmoji ? styles.textActive : styles.textInactive}>OFF</Text>
          </Pressable>
        </View>

        {/* HASHTAGS */}
        <Text style={styles.label}>Hashtags</Text>
        <View style={styles.rowWrap}>
          {[3, 5, 8, 10].map((v) => (
            <Pressable
              key={v}
              onPress={() => {
                setUseHashtags(true);
                setHashtagCount(v);
              }}
              style={[styles.pill, useHashtags && hashtagCount === v && styles.pillActive]}
            >
              <Text
                style={useHashtags && hashtagCount === v ? styles.textActive : styles.textInactive}
              >
                {v}
              </Text>
            </Pressable>
          ))}
          <Pressable onPress={() => setUseHashtags(false)}
            style={[styles.pill, !useHashtags && styles.pillActive]}>
            <Text style={!useHashtags ? styles.textActive : styles.textInactive}>OFF</Text>
          </Pressable>
        </View>

        {/* LANGUAGE 🚀 — ADDED BACK EXACTLY */}
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

        {/* ERROR */}
        {error ? <Text style={styles.error}>{error}</Text> : null}



        <View style={{ height: 80 }} />
      </ScrollView>
      <View style={styles.gnrbtn}>
        {/* GENERATE */}
        <Pressable
          onPress={generateCaptions}
          disabled={loading}
          style={({ pressed }) => [
            styles.generateBtn,
            pressed && { transform: [{ scale: 0.85 }], opacity: 0.8 }
          ]}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="sparkles" size={25} color="white" />
              <Text style={styles.generateText}> Generate Captions</Text>
            </>
          )}
        </Pressable>

      </View>
    </SafeAreaView>

  );
};

export default CaptionGeneratorScreen;

/* STYLES - unchanged */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#070707ff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 3,
    backgroundColor: "#0f0f0fff",
    borderBottomWidth: 0.3,
  },
  backbutton: {
    flexDirection: "row",
    alignItems: "center",

  },
  headerTitle: { color: "#7c7a7aff", marginLeft: 1, fontSize: 15, fontWeight: "400" },
  scroll: { padding: 16 },
  imageRow: { flexDirection: "row", marginBottom: 6 },
  addBox: {
    width: 50,
    height: 50,
    backgroundColor: "#1a1a1a",
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
  labelp: {
    color: "#dbd8d8ff", marginBottom: 6, fontSize: 14, fontWeight: 400
  },
  labelm: { color: "#7c7b7bff", marginBottom: 6, fontSize: 13 },
  label: { color: "#dbd8d8ff", marginTop: 14, marginBottom: 6, fontSize: 14, fontWeight: 400 },
  input: {
    backgroundColor: "#1a1a1a",
    padding: 12,
    borderRadius: 12,
    color: "white",
    minHeight: 60,
  },
  captionCard: {
    backgroundColor: "#1e1e1fff",
    borderRadius: 12,
    padding: 15,
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#ff5c5c"
  },
  captionTitle: { color: "#bbb", marginBottom: 6, fontSize: 14 },
  captionText: { color: "white", fontSize: 15, lineHeight: 22 },
  copyBtn: {
    flexDirection: "row",
    backgroundColor: "#ff5c5c",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
    width: "35%",
  },
  copyText: { color: "white", marginLeft: 8, fontWeight: "600" },
  error: { color: "#ff5c5c", marginTop: 10, textAlign: "center" },
  rowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#111",
    borderRadius: 18,
  },
  pillActive: { backgroundColor: "#ff5c5c" },
  textActive: { color: "white" },
  textInactive: { color: "#999" },
  dropdown: {
    backgroundColor: "#1a1a1a",
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dropdownText: { color: "#dbd8d8ff", fontSize: 16 },
  dropdownList: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 5,
  },
  dropdownItem: { padding: 12 },
  dropdownItemText: { color: "white" },
  gnrbtn: {
    position: "absolute",
    bottom: 15,
    justifyContent: "center",
    alignItems: "center",
    width: "100%"

  },
  generateBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#8d69e0",
    paddingVertical: 12,
    paddingHorizontal: 35,
    borderRadius: 14,
    marginTop: 30,
    gap: 10,
  },
  generateText: { color: "white", fontSize: 16 },
});
