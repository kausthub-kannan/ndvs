import { getPasuramsByPrabhandham, toggleBookmark } from '@/database/prabhandham';
import { useLanguage } from '@/context/language-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  Animated,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Pasuram, PasuramRow } from '@/components/pasuram-row';
import { useColors } from '@/hooks/use-colors';

const PAGE_SIZE = 100;

const removeDiacritics = (str: string): string => {
  try {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  } catch (e) {
    return str;
  }
};

export default function PasuramListScreen() {
  const { prabhandham } = useLocalSearchParams<{ prabhandham: string }>();
  const router = useRouter();
  const { language, showFullLyrics } = useLanguage();
  const colors = useColors();
  const [pasurams, setPasurams] = useState<Pasuram[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!prabhandham) return;
    setPage(0);
    setLoading(true);
    getPasuramsByPrabhandham(prabhandham)
      .then((rows) => setPasurams(rows as Pasuram[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [prabhandham]);

  // Reset page to 0 when search query changes
  useEffect(() => {
    setPage(0);
  }, [searchQuery]);

  const filteredPasurams = useMemo(() => {
    if (!searchQuery.trim()) return pasurams;
    const queryNorm = removeDiacritics(searchQuery).toLowerCase();
    return pasurams.filter((p) => {
      const siNoNorm = String(p.si_no).toLowerCase();
      const tamilNorm = p.tamil_scripts ? removeDiacritics(p.tamil_scripts).toLowerCase() : '';
      const englishNorm = p.english_scripts ? removeDiacritics(p.english_scripts).toLowerCase() : '';
      return (
        siNoNorm.includes(queryNorm) ||
        tamilNorm.includes(queryNorm) ||
        englishNorm.includes(queryNorm)
      );
    });
  }, [pasurams, searchQuery]);

  const paginatedPasurams = useMemo(() => {
    return filteredPasurams.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  }, [filteredPasurams, page]);

  const totalPages = Math.ceil(filteredPasurams.length / PAGE_SIZE);

  const handleBookmarkToggle = useCallback(async (id: number, current: number) => {
    const newVal = await toggleBookmark(id, current);
    setPasurams((prev) =>
      prev.map((p) => (p.id === id ? { ...p, bookmark: newVal } : p))
    );
  }, []);

  const handlePasuramPress = useCallback((id: number) => {
    router.push({ pathname: '/pasuram', params: { id: String(id) } });
  }, [router]);

  return (
    <SafeAreaView className="flex-1 bg-main">
      {/* Header */}
      <View className="px-5 pt-2.5 pb-1.5">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center mb-4"
        >
          <Ionicons name="chevron-back" size={20} color={colors.accent} />
          <Text className="text-accent text-[0.9375rem] ml-1 font-semibold">
            Back
          </Text>
        </TouchableOpacity>
        <Text
          className="text-text-primary text-[1.75rem] font-bold font-serif mb-1"
          numberOfLines={2}
        >
          {prabhandham}
        </Text>
        <Text className="text-text-muted text-[0.8125rem] mb-1">
          {filteredPasurams.length} {filteredPasurams.length === 1 ? 'Pasuram' : 'Pasurams'} {searchQuery.trim() ? '(filtered)' : ''}
        </Text>

        {/* Quick Search Bar */}
        <View className="flex-row items-center bg-surface border border-border-color rounded-xl px-3.5 h-11 mt-2">
          <Ionicons name="search" size={18} color={colors.tabIconDefault} className="mr-2" />
          <TextInput
            className="flex-1 text-text-primary text-sm p-0"
            placeholder="Quick search pasurams..."
            placeholderTextColor={colors.tabIconDefault}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} className="p-1">
              <Ionicons name="close-circle" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Divider */}
      <View className="h-px bg-border-color mx-5 mb-2" />

      <View className="flex-1">
        <FlatList
          data={paginatedPasurams}
          keyExtractor={(item) => String(item.id)}
          contentContainerClassName="px-4 pt-2 pb-[7.5rem]"
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <PasuramRow
              item={item}
              language={language}
              showFullLyrics={showFullLyrics}
              onBookmarkToggle={handleBookmarkToggle}
              onPress={handlePasuramPress}
            />
          )}
          ListEmptyComponent={
            loading ? null : (
              <View className="items-center mt-20">
                <Ionicons name="book-outline" size={48} color={colors.surfaceAlt} />
                <Text className="text-text-muted mt-4 text-[0.9375rem]">
                  {searchQuery ? 'No matching pasurams found.' : 'No pasurams found.'}
                </Text>
              </View>
            )
          }
          ListFooterComponent={
            totalPages > 1 ? (
              <View className="flex-row justify-center items-center py-6 gap-6">
                <TouchableOpacity
                  disabled={page === 0}
                  onPress={() => setPage((p) => Math.max(0, p - 1))}
                  className="p-2 opacity-100 disabled:opacity-30"
                >
                  <Ionicons name="chevron-back" size={24} color={colors.accent} />
                </TouchableOpacity>
                <Text className="text-text-muted font-semibold">
                  {page + 1} / {totalPages}
                </Text>
                <TouchableOpacity
                  disabled={page === totalPages - 1}
                  onPress={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  className="p-2 opacity-100 disabled:opacity-30"
                >
                  <Ionicons name="chevron-forward" size={24} color={colors.accent} />
                </TouchableOpacity>
              </View>
            ) : null
          }
        />

        {/* Bottom gradient */}
        <LinearGradient
          colors={['transparent', `${colors.main}E6`, colors.main]}
          className="absolute bottom-0 left-0 right-0 h-20"
          pointerEvents="none"
        />
      </View>
    </SafeAreaView>
  );
}
