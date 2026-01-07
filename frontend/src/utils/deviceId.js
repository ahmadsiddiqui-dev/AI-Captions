import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";

export const getOrCreateDeviceId = async () => {
  let deviceId = await AsyncStorage.getItem("device_id");

  if (!deviceId) {
    deviceId = uuidv4();
    await AsyncStorage.setItem("device_id", deviceId);
  }

  return deviceId;
};
