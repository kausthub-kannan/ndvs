import { Colors } from '@/constants/theme';
import { useLanguage } from '@/context/language-context';
import { useColors } from '@/hooks/use-colors';
import { MaterialIcons } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React from 'react';
import {
  ScrollView,
  Switch,
  Text,
  View
} from 'react-native';
import { PillToggle } from '@/components/pill-toggle';
import { PrefRow } from '@/components/pref-row';
import { ToggleCard } from '@/components/toggle-card';
import { SafeAreaView } from 'react-native-safe-area-context';




export default function SettingsScreen() {
  const { language, setLanguage, showFullLyrics, setShowFullLyrics } = useLanguage();
  const { colorScheme, setColorScheme } = useColorScheme();
  const colors = useColors();
  const isTamil = language === 'tamil';
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-main">
      <ScrollView contentContainerClassName="px-5 pb-[7.5rem]">

        {/* ── Header ── */}
        <View className="items-center mt-8 mb-8">
          <View className="bg-surface rounded-full p-5 mb-4">
            <Feather name="settings" size={44} color={colors.accent} />
          </View>
          <Text className="text-text-primary text-3xl font-bold font-serif">Settings</Text>
        </View>

        {/* ── Quick toggles row (Theme + Script) ── */}
        <View className="flex-row justify-evenly items-start bg-surface rounded-[1.25rem] py-5 px-4 mb-7">
          {/* Theme toggle */}
          <ToggleCard caption={isDark ? 'Dark' : 'Light'}>
            <PillToggle
              active={isDark}
              onToggle={() => setColorScheme(isDark ? 'light' : 'dark')}
              leftIcon={<Feather name="sun" size={14} color="#fff" />}
              rightIcon={<Feather name="moon" size={14} color="#fff" />}
            />
          </ToggleCard>

          {/* Divider */}
          <View className="w-px bg-border-color self-stretch mx-2" />

          {/* Script toggle */}
          <ToggleCard caption={isTamil ? 'Tamil' : 'English'}>
            <PillToggle
              active={isTamil}
              onToggle={() => setLanguage(isTamil ? 'english' : 'tamil')}
              leftLabel="E"
              rightLabel="அ"
            />
          </ToggleCard>
        </View>

        {/* ── Preferences ── */}
        <Text className="text-text-muted text-[0.6875rem] font-bold tracking-[0.075rem] uppercase mb-3">
          Preferences
        </Text>
        <View className="gap-3">
          <PrefRow
            icon={<MaterialIcons name="format-align-left" size={22} color={colors.textMuted} />}
            label="Pasuram Preview"
            value={showFullLyrics ? 'Full lyrics' : 'First few lines'}
            control={
              <Switch
                value={showFullLyrics}
                onValueChange={setShowFullLyrics}
                trackColor={{ false: colors.surfaceAlt, true: colors.accent }}
                thumbColor={showFullLyrics ? '#fff' : colors.textMuted}
              />
            }
          />
          <PrefRow
            icon={<MaterialIcons name="info-outline" size={22} color={colors.textMuted} />}
            label="App"
            value="About"
            control={<Feather name="chevron-right" size={18} color={colors.surfaceAlt} />}
            onPress={() => router.push('/about')}
          />
        </View>



      </ScrollView>
    </SafeAreaView>
  );
}
