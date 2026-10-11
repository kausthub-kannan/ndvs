import { useLanguage } from '@/context/language-context';
import { getAcharyaById } from '@/database/acharyas';
import { getAlwarById } from '@/database/alwar';
import { getDivyaDeshamById } from '@/database/divya-desham';
import { useColors } from '@/hooks/use-colors';
import { parseBoldText } from '@/utils/parse-bold';
import MapEmbed from './map-embed';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type TagItem = {
  label: string;
  value: string;
};

type ThemedImage = { light: any; dark: any };

// Static image maps using new light and dark directories
const ACHARYA_IMAGES: Record<string, ThemedImage> = {
};

const ALWAR_IMAGES: Record<string, ThemedImage> = {
  'Bhūtat Āḻvār': { light: require('@/assets/images/light/Bhūtat Āḻvār.jpg'), dark: require('@/assets/images/dark/Bhūtat Āḻvār Dark.jpg') },
  'Kulasekara Āḻvār': { light: require('@/assets/images/light/Kulasekara Āḻvār.jpg'), dark: require('@/assets/images/dark/Kulasekara Āḻvār Dark.jpg') },
  'Madhurakavi Āḻvār': { light: require('@/assets/images/light/Madhurakavi Āḻvār.jpg'), dark: require('@/assets/images/dark/Madhurakavi Āḻvār Dark.jpg') },
  'Nammāḻvār': { light: require('@/assets/images/light/Nammāḻvār.jpg'), dark: require('@/assets/images/dark/Nammāḻvār Dark.jpg') },
  'Periyāḻvār': { light: require('@/assets/images/light/Periyāḻvār.jpg'), dark: require('@/assets/images/dark/Periyāḻvār Dark.jpg') },
  'Pey Āḻvār': { light: require('@/assets/images/light/Pey Āḻvār.jpg'), dark: require('@/assets/images/dark/Pey Āḻvār Dark.jpg') },
  'Poygai Āḻvār': { light: require('@/assets/images/light/Poygai Āḻvār.jpg'), dark: require('@/assets/images/dark/Poygai Āḻvār Dark.jpg') },
  'Tirumalisai Āḻvār': { light: require('@/assets/images/light/Tirumalisai Āḻvār.jpg'), dark: require('@/assets/images/dark/Tirumalisai Āḻvār Dark.jpg') },
  'Tirumaṅgai Āḻvār': { light: require('@/assets/images/light/Tirumaṅgai Āḻvār.jpg'), dark: require('@/assets/images/dark/Tirumaṅgai Āḻvār Dark.jpg') },
  'Tiruppāṇ Āḻvār': { light: require('@/assets/images/light/Tiruppāṇ Āḻvār.jpg'), dark: require('@/assets/images/dark/Tiruppāṇ Āḻvār Dark.jpg') },
  'Toṇḍaraḍippoḍi Āḻvār': { light: require('@/assets/images/light/Toṇḍaraḍippoḍi Āḻvār.jpg'), dark: require('@/assets/images/dark/Toṇḍaraḍippoḍi Āḻvār Dark.jpg') },
  'Āṇḍāḻ': { light: require('@/assets/images/light/Āṇḍāḻ.jpg'), dark: require('@/assets/images/dark/Āṇḍāḻ Dark.jpg') },
};

const DIVYA_DESHAM_IMAGES: Record<string, ThemedImage> = {
};

export const IMAGE_MAPS: Record<string, Record<string, ThemedImage>> = {
  acharyas: ACHARYA_IMAGES,
  alwars: ALWAR_IMAGES,
  'divya-deshams': DIVYA_DESHAM_IMAGES,
};

export function getImageSource(category: string, name: string, isDark: boolean): any | null {
  const map = IMAGE_MAPS[category];
  if (!map) return null;
  const themedImage = map[name];
  if (!themedImage) return null;
  return isDark ? themedImage.dark : themedImage.light;
}

function extractTags(item: Record<string, any>): TagItem[] {
  const tags: TagItem[] = [];
  const skipKeys = ['id', 'name', 'bio', 'info', 'coordinates', 'taniyan_tamil', 'taniyan_english'];

  for (const [key, value] of Object.entries(item)) {
    if (skipKeys.includes(key)) continue;
    if (value && typeof value === 'string' && value.trim()) {
      const label = key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      tags.push({ label, value: value.trim() });
    }
  }
  return tags;
}

function getDescriptionField(item: Record<string, any>, category: string): string {
  if (category === 'divya-deshams') {
    return item.info || '';
  }
  return item.bio || '';
}

const fetchFunctions: Record<string, (id: number) => Promise<any>> = {
  acharyas: getAcharyaById,
  alwars: getAlwarById,
  'divya-deshams': getDivyaDeshamById,
};

const TAG_COLORS = [
  { bg: '#FFE4E6', text: '#9F1239' },
  { bg: '#DCFCE7', text: '#166534' },
  { bg: '#DBEAFE', text: '#1D4ED8' },
  { bg: '#FEF3C7', text: '#92400E' },
  { bg: '#F3E8FF', text: '#6B21A8' },
  { bg: '#CCFBF1', text: '#115E59' },
];

const renderFormattedContent = (content: string, justify = false) => {
  if (!content) return null;
  const decodedContent = content.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  const parts = decodedContent.split(/(<verse>[\s\S]*?<\/verse>)/g);
  return (
    <View className="pr-2">
      {parts.map((part, index) => {
        if (part.startsWith('<verse>') && part.endsWith('</verse>')) {
          const verseText = part.substring(7, part.length - 8).trim();
          return (
            <Text
              key={index}
              style={{
                fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
                lineHeight: 30,
                textAlign: 'center',
              }}
              className="text-lyric-text text-[1rem] tracking-[0.01875rem] my-3"
              selectable={true}
            >
              {parseBoldText(verseText)}
            </Text>
          );
        } else {
          const trimmed = part.trim();
          if (!trimmed) return null;
          return (
            <Text
              key={index}
              style={{
                fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
                lineHeight: 30,
              }}
              className={`text-text-muted text-[1rem] tracking-[0.0125rem] text-justify`}
              selectable={true}
            >
              {parseBoldText(trimmed)}
            </Text>
          );
        }
      })}
    </View>
  );
};

export default function GeneralInfo() {
  const { id, category } = useLocalSearchParams<{ id: string; category: string }>();
  const router = useRouter();
  const colors = useColors();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { language } = useLanguage();

  const [item, setItem] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);

  const loadItem = useCallback(async () => {
    setLoading(true);
    try {
      const fetchFn = fetchFunctions[category];
      if (fetchFn) {
        const row = await fetchFn(Number(id));
        setItem(row);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id, category]);

  useEffect(() => {
    if (id && category) loadItem();
  }, [id, category, loadItem]);

  if (loading || !item) {
    return (
      <SafeAreaView className="flex-1 bg-main">
        <View className="flex-1 items-center justify-center">
          <Text className="text-text-muted text-base">Loading…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const description = getDescriptionField(item, category);
  const tags = extractTags(item);
  const imageSource = getImageSource(category, item.name, isDark);

  let lat: number | null = null;
  let lng: number | null = null;
  if (category === 'divya-deshams' && item.coordinates) {
    const parts = item.coordinates.split(',');
    if (parts.length === 2) {
      const parsedLat = parseFloat(parts[0].trim());
      const parsedLng = parseFloat(parts[1].trim());
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        lat = parsedLat;
        lng = parsedLng;
      }
    }
  }

  const categoryTitle = category
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c: string) => c.toUpperCase());

  return (
    <SafeAreaView className="flex-1 bg-main">
      {/* Top Bar */}
      <View className="px-[1.125rem] py-2.5">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={22} color={colors.accent} />
          <Text className="text-accent text-[0.9375rem] font-semibold ml-0.5">Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerClassName="pl-6 pr-5 pb-[8.125rem]"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header block ── */}
        <View className="mb-[1.125rem]">
          <Text className="text-accent text-[0.8125rem] font-bold tracking-[0.075rem] uppercase mb-1.5">{categoryTitle}</Text>
          <Text
            style={{ fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }) }}
            className="text-text-primary text-[1.625rem] font-bold tracking-[0.01875rem]"
          >
            {item.name}
          </Text>
        </View>

        {/* Image — only rendered if a static require exists in the map */}
        {imageSource ? (
          <View className="items-center mb-5">
            <Image
              source={imageSource}
              className="w-40 h-[12.5rem] rounded-2xl bg-surface"
              resizeMode="cover"
            />
          </View>
        ) : null}

        {/* Tags */}
        {tags.length > 0 ? (
          <View className="flex-row flex-wrap gap-1.5 mb-5">
            {tags.map((tag, idx) => {
              const colorScheme = TAG_COLORS[idx % TAG_COLORS.length];
              return (
                <View
                  key={`tag-${idx}`}
                  className="px-2.5 py-1.5 rounded-md items-center justify-center" style={{ backgroundColor: colorScheme.bg }}
                >
                  <Text className="text-[0.6875rem] font-bold tracking-[0.0125rem]" style={{ color: colorScheme.text }}>
                    {tag.label}: {tag.value}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : null}

        {/* ── Thin divider ── */}
        <View className="h-px bg-border-color mb-6" />

        {/* ── Taniyan (Āḻvārs only) ── */}
        {category === 'alwars' && (() => {
          const taniyan = language === 'tamil' ? item.taniyan_tamil : item.taniyan_english;
          if (!taniyan) return null;
          return (
            <View className="mb-[1.625rem]">
              <Text className="text-accent text-[0.6875rem] font-bold tracking-[0.0875rem] uppercase mb-2.5">
                Taniyan
              </Text>
              <View className="items-center px-3">
                <Text
                  style={{
                    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
                    lineHeight: 30,
                  }}
                  className="text-lyric-text text-[1rem] text-center tracking-[0.01875rem]"
                  selectable={true}
                >
                  {parseBoldText(taniyan.replace(/\\\\/g, '').trim())}
                </Text>
              </View>
            </View>
          );
        })()}

        {/* ── Map Embed ── */}
        {lat !== null && lng !== null ? (
          <View className="mb-[1.625rem]">
            <Text className="text-accent text-[0.6875rem] font-bold tracking-[0.0875rem] uppercase mb-2.5">
              Location
            </Text>
            <MapEmbed lat={lat} lng={lng} placeName={item.name} />
          </View>
        ) : null}

        {/* ── Description ── */}
        {description ? (
          <View className="mb-[1.625rem]">
            <Text className="text-accent text-[0.6875rem] font-bold tracking-[0.0875rem] uppercase mb-2.5">
              {category === 'divya-deshams' ? 'About' : 'Biography'}
            </Text>
            {renderFormattedContent(description, true)}
          </View>
        ) : null}
      </ScrollView>

      {/* Bottom gradient */}
      <LinearGradient
        colors={['transparent', `${colors.main}CC`, colors.main]}
        className="absolute bottom-0 left-0 right-0 h-[5.625rem]"
        pointerEvents="none"
      />
    </SafeAreaView>
  );
}

