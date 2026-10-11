/**
 * Semantic colour tokens used across the app.
 * These mirror the Tailwind config tokens in tailwind.config.js.
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    // Backgrounds
    main: '#F5F5F0',
    surface: '#FFFFFF',
    surfaceAlt: '#D1D5DB',
    cardFallback: '#D1D5DB',
    // Borders
    borderColor: '#E5E7EB',
    // Text
    text: '#11181C',
    textPrimary: '#1A1A1A',
    textMuted: '#6B7280',
    tabIconDefault: '#6B7280',
    tabIconSelected: '#E8904B',
    // Brand
    accent: '#4b72e8',
    accentDark: '#4962b8',
    tint: '#4b72e8',
    icon: '#6B7280',
    background: '#F5F5F0',
    // Semantic
    danger: '#E85D75',
    lyricText: '#4A3728',
  },
  dark: {
    // Backgrounds
    main: '#181A1F',
    surface: '#1E2228',
    surfaceAlt: '#3E464E',
    cardFallback: '#7A7A7A',
    // Borders
    borderColor: '#2C3540',
    // Text
    text: '#ECEDEE',
    textPrimary: '#ECEDEE',
    textMuted: '#A3AAB1',
    tabIconDefault: '#6B7280',
    tabIconSelected: '#E8904B',
    // Brand
    accent: '#E8904B',
    accentDark: '#C96A2A',
    tint: '#ECEDEE',
    icon: '#9BA1A6',
    background: '#181A1F',
    // Semantic
    danger: '#E85D75',
    lyricText: '#E8DDD0',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
