import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DarkTheme, LightTheme } from "./colors";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(DarkTheme);

  useEffect(() => {
    const loadTheme = async () => {
      const saved = await AsyncStorage.getItem("APP_THEME");
      if (saved === "light") setTheme(LightTheme);
      if (saved === "dark") setTheme(DarkTheme);
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const nextTheme = theme.mode === "dark" ? LightTheme : DarkTheme;
    setTheme(nextTheme);
    await AsyncStorage.setItem("APP_THEME", nextTheme.mode);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
