import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=YOUR_PACKAGE_NAME';

const RateAppModal = ({ visible, onClose }) => {
  const [rating, setRating] = useState(0);

  const handleRate = () => {
    Linking.openURL(PLAY_STORE_URL);
    onClose();
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>Enjoying the app?</Text>
          <Text style={styles.subtitle}>Tap a star to rate us</Text>

          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((i) => (
              <TouchableOpacity key={i} onPress={() => setRating(i)}>
                <Icon
                  name={rating >= i ? 'star' : 'star-outline'}
                  size={34}
                  color="#faca2bff"
                />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.button, !rating && { opacity: 0.5 }]}
            disabled={!rating}
            onPress={handleRate}
          >
            <Text style={styles.buttonText}>Rate Now</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
            <Text style={styles.later}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default RateAppModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: '75%',
    backgroundColor: '#2a2736',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  title: { color: '#fff', fontSize: 18, fontWeight: '600' },
  subtitle: { color: '#aaa', marginVertical: 8 },
  stars: { flexDirection: 'row', marginVertical: 12 },
  button: {
    backgroundColor: '#7d5df8',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  buttonText: { color: 'white', fontWeight: '600' },
  later: { color: '#aaa', marginTop: 15},
});
