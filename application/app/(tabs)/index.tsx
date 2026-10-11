import { getPasuramOfDay, toggleBookmark } from '@/database/prabhandham';
import { PasuramDetail } from '@/database/utils/db';
import { useLanguage } from '@/context/language-context';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useColors } from '@/hooks/use-colors';
import { useColorScheme } from 'nativewind';
import { HeartButton } from '@/components/pasuram-heart-button';

export default function HomeScreen() {
  const colors = useColors();
  const { language, showFullLyrics } = useLanguage();
  const router = useRouter();

  const [pasuram, setPasuram] = useState<PasuramDetail | null>(null);

  useEffect(() => {
    getPasuramOfDay().then(setPasuram).catch(console.error);
  }, []);

  const handleBookmarkToggle = async (id: number, current: number) => {
    const newVal = await toggleBookmark(id, current);
    setPasuram((prev) => (prev && prev.id === id ? { ...prev, bookmark: newVal } : prev));
  };

  const handlePress = (target: string) => {
    switch (target) {
      case 'Prabhadham':
        router.push('/(tabs)/prabhandham');
        break;
      case 'Alwars':
        router.push('/alwars');
        break;
      case 'Acharyas':
        router.push('/acharyas');
        break;
      case '108 Divya Deshams':
        router.push('/divya-deshams');
        break;
      case 'Glossary':
        router.push('/glossory');
        break;
      default:
        break;
    }
  };

  const lyricsText = pasuram
    ? (language === 'tamil' ? pasuram.tamil_scripts : pasuram.english_scripts)
    : null;

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Static requires are necessary in React Native; dynamic string interpolation in require() fails at bundle time.
  const cardImages = {
    prabhandham: isDark ? require('@/assets/images/dark/Bookshelf Dark.jpg') : require('@/assets/images/light/Bookshelf.jpg'),
    alwars: isDark ? require('@/assets/images/dark/Nammāḻvār Dark.jpg') : require('@/assets/images/light/Nammāḻvār.jpg'),
    acharyas: isDark ? require('@/assets/images/dark/Rāmānuja Dark.jpg') : require('@/assets/images/light/Rāmānuja.jpg'),
    divyaDeshams: isDark ? require('@/assets/images/dark/Śrī Raṅganātha Dark.jpg') : require('@/assets/images/light/Śrī Raṅganātha.jpg'),
  };

  return (
    <SafeAreaView className="flex-1 bg-main">
      <ScrollView contentContainerClassName="p-5 pb-[6.25rem]">
        <Text className="text-[2.5rem] font-bold text-text-primary text-center my-[1.875rem] font-serif">Library</Text>

        {/* ── Grid cards ── */}
        <View className="flex-row flex-wrap justify-between mb-[0.875rem]">
          <TouchableOpacity className="w-[47%] aspect-square bg-card-fallback rounded-xl mb-5 overflow-hidden relative" onPress={() => handlePress('Prabhadham')}>
            <Image source={cardImages.prabhandham} className="w-full h-full opacity-80" resizeMode="cover" />
            <View className="absolute inset-0 justify-center items-center bg-black/20">
              <Text className="text-white text-lg font-bold text-center font-serif" style={{ textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: {width: -1, height: 1}, textShadowRadius: 10 }}>Prabandha Mālai</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="w-[47%] aspect-square bg-card-fallback rounded-xl mb-5 overflow-hidden relative" onPress={() => handlePress('Alwars')}>
            <Image source={cardImages.alwars} className="w-full h-full opacity-80" resizeMode="cover" />
            <View className="absolute inset-0 justify-center items-center bg-black/20">
              <Text className="text-white text-lg font-bold text-center font-serif" style={{ textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: {width: -1, height: 1}, textShadowRadius: 10 }}>Āḻvārs</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="w-[47%] aspect-square bg-card-fallback rounded-xl mb-5 overflow-hidden relative" onPress={() => handlePress('Acharyas')}>
            <Image source={cardImages.acharyas} className="w-full h-full opacity-80" resizeMode="cover" />
            <View className="absolute inset-0 justify-center items-center bg-black/20">
              <Text className="text-white text-lg font-bold text-center font-serif" style={{ textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: {width: -1, height: 1}, textShadowRadius: 10 }}>Achāryas</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="w-[47%] aspect-square bg-card-fallback rounded-xl mb-5 overflow-hidden relative" onPress={() => handlePress('108 Divya Deshams')}>
            <Image source={cardImages.divyaDeshams} className="w-full h-full opacity-80" resizeMode="cover" />
            <View className="absolute inset-0 justify-center items-center bg-black/20">
              <Text className="text-white text-lg font-bold text-center font-serif" style={{ textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: {width: -1, height: 1}, textShadowRadius: 10 }}>108{"\n"}Divya Deśams</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── List rows ── */}
        <View className="gap-[0.9375rem] mb-4">
          <TouchableOpacity
            className="flex-row items-center bg-surface rounded-xl mb-2.5 py-4 px-[1.125rem] border border-border-color"
            onPress={() => router.push('/nearby-divya-deshams')}
          >
            <Ionicons name="compass" size={24} color={colors.accent} className="mr-[0.9375rem]" />
            <View className="flex-1">
              <Text className="text-text-primary text-[1.0625rem] font-semibold font-serif">Find Divya Deśams Near Me</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.tabIconDefault} />
          </TouchableOpacity>
        </View>

        {/* ── Pasuram of the Day ── */}
        <Text className="text-text-muted text-[0.6875rem] font-bold tracking-[0.075rem] uppercase mb-3">
          Pasuram of the Day
        </Text>
        {pasuram ? (
          <TouchableOpacity
            activeOpacity={0.72}
            onPress={() => router.push({ pathname: '/pasuram', params: { id: String(pasuram.id) } })}
            className="flex-row items-center bg-surface rounded-xl mb-2.5 py-3.5 px-4 border border-border-color"
          >
            <View className="flex-1">
              <Text
                className="text-text-muted text-[0.6875rem] font-semibold tracking-[0.03125rem] uppercase mb-2"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {pasuram.prabhandham} · {pasuram.azhwar} . {pasuram.si_no}
              </Text>
              {lyricsText ? (
                <Text
                  className="text-text-primary text-[0.9375rem] leading-[1.375rem] font-serif"
                  numberOfLines={showFullLyrics ? undefined : 2}
                >
                  {lyricsText.replace(/\\/g, '')}
                </Text>
              ) : null}
            </View>

            <View className="ml-3">
              <HeartButton
                bookmarked={pasuram.bookmark === 1}
                onToggle={() => handleBookmarkToggle(pasuram.id, pasuram.bookmark)}
              />
            </View>
          </TouchableOpacity>
        ) : (
          <View className="bg-surface rounded-xl p-6 items-center border border-border-color">
            <Text className="text-sm" style={{ color: colors.tabIconDefault }}>{"Loading today's pasuram…"}</Text>
          </View>
        )}

        <TouchableOpacity className="flex-row items-center bg-surface rounded-xl my-1 py-4 px-[1.125rem] border border-border-color" onPress={() => handlePress('Glossary')}>
            <MaterialIcons name="bookmark" size={24} color={colors.tabIconDefault} className="mr-[0.9375rem]" />
            <View className="flex-1">
              <Text className="text-text-primary text-[1.0625rem] font-semibold font-serif">Glossary</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.tabIconDefault} />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
