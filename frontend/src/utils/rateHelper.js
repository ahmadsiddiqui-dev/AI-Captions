import AsyncStorage from "@react-native-async-storage/async-storage";

let setRateVisible = null;

const LAST_SHOWN_KEY = "rate_popup_last_shown";
const COOLDOWN_DAYS = 15; 

export const registerRatePopup = (fn) => {
  setRateVisible = fn;
};

/**
 * Auto trigger (caption count / time / success)
 * Shows only if cooldown passed
 */
export const tryShowRatePopup = async () => {
  const lastShown = await AsyncStorage.getItem(LAST_SHOWN_KEY);

  if (lastShown) {
    const daysPassed =
      (Date.now() - Number(lastShown)) / (1000 * 60 * 60 * 24);

    if (daysPassed < COOLDOWN_DAYS) return;
  }

  if (setRateVisible) {
    setRateVisible(true);
    await AsyncStorage.setItem(
      LAST_SHOWN_KEY,
      Date.now().toString()
    );
  }
};

/**
 * Manual trigger (Settings → Rate us)
 * ALWAYS allowed
 */
export const showRatePopup = () => {
  if (setRateVisible) {
    setRateVisible(true);
  }
};
