import React, { useState, useEffect } from 'react';
import GlobalNavbar from '@/components/global-navbar';
import { Colors } from '@/constants/theme';
import { LanguageProvider } from '@/context/language-context';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { View } from 'react-native';
import 'react-native-reanimated';
import '../global.css';
import { isDisclaimerAccepted } from '@/database/user';
import Disclaimer from '@/components/disclaimer';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme !== 'light';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const [isReady, setIsReady] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    async function checkDisclaimer() {
      try {
        const accepted = await isDisclaimerAccepted();
        if (!accepted) {
          setShowDisclaimer(true);
        }
      } catch (error) {
        console.error('[RootLayout] Error checking disclaimer status:', error);
      } finally {
        setIsReady(true);
      }
    }
    checkDisclaimer();
  }, []);

  if (!isReady) {
    return <View style={{ flex: 1, backgroundColor: colors.main }} />;
  }

  return (
    <LanguageProvider>
      <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <View style={{ flex: 1, backgroundColor: colors.main }} className={isDark ? "dark" : ""}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            <Stack.Screen name="pasurams" options={{ headerShown: false }} />
            <Stack.Screen name="pasuram" options={{ headerShown: false }} />
            <Stack.Screen name="general-info" options={{ headerShown: false }} />
            <Stack.Screen name="acharyas" options={{ headerShown: false }} />
            <Stack.Screen name="alwars" options={{ headerShown: false }} />
            <Stack.Screen name="divya-deshams" options={{ headerShown: false }} />
            <Stack.Screen name="favorites" options={{ headerShown: false }} />
            <Stack.Screen name="about" options={{ headerShown: false }} />
            <Stack.Screen name="glossory" options={{ headerShown: false }} />
            <Stack.Screen name="nearby-divya-deshams" options={{ headerShown: false }} />
          </Stack>
          <GlobalNavbar />
          {showDisclaimer && (
            <Disclaimer onAccept={() => setShowDisclaimer(false)} />
          )}
        </View>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </ThemeProvider>
    </LanguageProvider>
  );
}

