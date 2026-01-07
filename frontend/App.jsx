
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator, TransitionPresets } from "@react-navigation/stack";
import { SafeAreaProvider } from "react-native-safe-area-context";


import RateAppModal from "./src/components/RateAppModal";
import { registerRatePopup } from "./src/utils/rateHelper";

import HomeScreen from "./screens/HomeScreen";
import Settings from "./screens/Settings";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import OtpScreen from "./screens/OtpScreen";
import ResetPasswordScreen from "./screens/ResetPasswordScreen";
import CaptionGeneratorScreen from "./screens/CaptionGeneratorScreen";
import SubscriptionScreen from "./screens/SubscriptionScreen";
import ManageSubscriptionScreen from "./screens/ManageSubscriptionScreen";

const Stack = createStackNavigator();

export default function App() {

  const [showRate, setShowRate] = useState(false);

  useEffect(() => {
    registerRatePopup(setShowRate);
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              ...TransitionPresets.SlideFromRightIOS,
              gestureEnabled: true,
              transitionSpec: {
                open: {
                  animation: "timing",
                  config: { duration: 200 },
                },
                close: {
                  animation: "timing",
                  config: { duration: 200 },
                },
              },
            }}
          >
            {/* MAIN SCREENS */}
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Settings" component={Settings} />
            <Stack.Screen name="CaptionGeneratorScreen" component={CaptionGeneratorScreen} />

            {/* AUTH SCREENS */}
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />

            {/* PASSWORD RESET FLOW */}
            <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
            <Stack.Screen name="OtpScreen" component={OtpScreen} />
            <Stack.Screen name="ResetPasswordScreen"  component={ResetPasswordScreen} />

            {/* SUBSCRIPTION FLOW */}
            <Stack.Screen name="Subscription" component={SubscriptionScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ManageSubscription" component={ManageSubscriptionScreen} />
            
          </Stack.Navigator>

          {/*   */}
          <RateAppModal visible={showRate} onClose={() => setShowRate(false)}
          />
        </>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
