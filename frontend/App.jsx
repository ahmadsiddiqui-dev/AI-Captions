// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator, TransitionPresets } from "@react-navigation/stack";

import HomeScreen from "./screens/HomeScreen";
import Settings from "./screens/Settings";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import OtpScreen from "./screens/OtpScreen";
import ResetPasswordScreen from "./screens/ResetPasswordScreen";
import CaptionGeneratorScreen from "./screens/CaptionGeneratorScreen";

// const API_URL = "https://overtruly-biblical-azaria.ngrok-free.dev";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
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

        {/* MAIN APP ROUTES */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="CaptionGeneratorScreen" component={CaptionGeneratorScreen} />

        {/* AUTH ROUTES */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />

        {/* PASSWORD RESET FLOW */}
        <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
        <Stack.Screen name="OtpScreen" component={OtpScreen} />
        <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
