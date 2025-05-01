import { DefaultTheme, DarkTheme } from '@react-navigation/native';

export const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4F46E5',
    background: '#F9FAFB',
    card: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#999999',
    border: '#E5E7EB',
    accent: '#8B5CF6',
    success: '#10B981',
    cardBackground: '#FFFFFF',
  },
};

export const darkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#6366F1',
    secondary: '#9193F5',
    background: '#111827',
    card: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#9C9D9D',
    border: '#374151',
    accent: '#A78BFA',
    success: '#059669',
    cardBackground: '#1F2937',
  },
};

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

const THEME_STORAGE_KEY = '@app_theme_mode';

const ThemeContext = createContext({
  theme: lightTheme,
  themeMode: THEME_MODES.SYSTEM,
  isDarkMode: false,
  setThemeMode: () => {},
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  
  const [themeMode, setThemeMode] = useState(THEME_MODES.SYSTEM);
  
  const isDarkMode = 
    themeMode === THEME_MODES.DARK || 
    (themeMode === THEME_MODES.SYSTEM && systemColorScheme === 'dark');
  
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedThemeMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedThemeMode !== null) {
          setThemeMode(savedThemeMode);
        }
      } catch (error) {
        console.error('Failed to load theme preference', error);
      }
    };
    
    loadThemePreference();
  }, []);
  
  useEffect(() => {
    const saveThemePreference = async () => {
      try {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, themeMode);
      } catch (error) {
        console.error('Failed to save theme preference', error);
      }
    };
    
    saveThemePreference();
  }, [themeMode]);
  
  const toggleTheme = () => {
    setThemeMode(prevMode => {
      if (prevMode === THEME_MODES.SYSTEM || prevMode === THEME_MODES.LIGHT) {
        return THEME_MODES.DARK;
      } 
      return THEME_MODES.LIGHT;
    });
  };
  
  const useSystemTheme = () => {
    setThemeMode(THEME_MODES.SYSTEM);
  };
  
  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeMode,
        isDarkMode,
        setThemeMode,
        toggleTheme,
        useSystemTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

