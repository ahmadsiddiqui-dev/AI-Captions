import * as RNIap from "react-native-iap";

export const subscriptionSkus = ["monthly_plan", "yearly_plan"];

export const initIAP = async () => {
  try {
    await RNIap.initConnection();
  } catch (e) {
    console.log("IAP init error:", e);
  }
};
