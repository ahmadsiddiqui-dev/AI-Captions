import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Linking,
  Pressable,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=YOUR_PACKAGE_NAME";

const GLASS_BG = "rgba(255,255,255,0.08)";
const GLASS_BORDER = "rgba(255,255,255,0.15)";
const GLASS_TEXT = "#E5E5EA";
const GLASS_SUBTEXT = "#A1A1A6";
const ACCENT_GOLD = "#F5C77A";

const RateAppModal = ({ visible, onClose }) => {
  const [rating, setRating] = useState(0);

  const handleRate = () => {
    Linking.openURL(PLAY_STORE_URL);
    onClose();
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={styles.box}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={styles.title}>Enjoying Captions?</Text>
          <Text style={styles.subtitle}>Tap a star to rate us</Text>

          {/* STARS */}
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Pressable
                key={i}
                onPress={() => setRating(i)}
                style={({ pressed }) => pressed && { opacity: 0.7 }}
              >
                <Icon
                  name={rating >= i ? "star" : "star-outline"}
                  size={34}
                  color={ACCENT_GOLD}
                />
              </Pressable>
            ))}
          </View>

          {/* RATE BUTTON */}
          <Pressable
            disabled={!rating}
            onPress={handleRate}
            style={({ pressed }) => [
              styles.button,
              !rating && { opacity: 0.4 },
              pressed && { opacity: 0.75 },
            ]}
          >
            <Text style={styles.buttonText}>Rate Now</Text>
          </Pressable>

          <Pressable onPress={onClose} style={{ marginTop: 16 }}>
            <Text style={styles.later}>Maybe later</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default RateAppModal;
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  box: {
    width: "78%",
    backgroundColor: "rgba(30,30,30,0.92)",
    borderRadius: 18,
    padding: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },

  title: {
    color: GLASS_TEXT,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },

  subtitle: {
    color: GLASS_SUBTEXT,
    fontSize: 14,
    marginBottom: 12,
  },

  stars: {
    flexDirection: "row",
    gap: 10,
    marginVertical: 14,
  },

  button: {
    marginTop: 10,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 36,
    backgroundColor: "rgba(245,199,122,0.12)",
    borderWidth: 1,
    borderColor: "rgba(245,199,122,0.35)",
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  later: {
    color: GLASS_SUBTEXT,
    fontSize: 14,
  },
});
