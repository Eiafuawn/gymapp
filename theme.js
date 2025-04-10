// theme.js - Theme configuration
import { DefaultTheme, DarkTheme } from '@react-navigation/native';

// Theme configuration
export const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4F46E5',
    background: '#F9FAFB',
    card: '#FFFFFF',
    text: '#1F2937',
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
    background: '#111827',
    card: '#1F2937',
    text: '#F9FAFB',
    border: '#374151',
    accent: '#A78BFA',
    success: '#059669',
    cardBackground: '#1F2937',
  },
};
