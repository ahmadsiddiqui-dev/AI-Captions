import AsyncStorage from "@react-native-async-storage/async-storage";
import DeviceInfo from "react-native-device-info";

export const getOrCreateDeviceId = async () => {
  let deviceId = await AsyncStorage.getItem("device_id");

  if (!deviceId) {
    deviceId = DeviceInfo.getUniqueIdSync();
    await AsyncStorage.setItem("device_id", deviceId);
  }

  return deviceId;
};
