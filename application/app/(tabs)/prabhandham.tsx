import { getPrabhandhamList } from '@/database/prabhandham';
import { Card, PrabhandhamItem } from '@/components/prabhandham-card';
import { useColors } from '@/hooks/use-colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const removeDiacritics = (str: string): string => {
  try {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  } catch (e) {
    return str;
  }
};

export default function PrabhandhamScreen() {
  const [data, setData] = useState<PrabhandhamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const colors = useColors();

  const handleCardPress = (prabhandham: string) => {
    router.push({ pathname: '/pasurams', params: { prabhandham } });
  };

  useEffect(() => {
    getPrabhandhamList()
      .then((rows) => {
        setData(rows as PrabhandhamItem[]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const queryNorm = removeDiacritics(searchQuery).toLowerCase();
    return data.filter((item) => {
      const prabhandhamNorm = removeDiacritics(item.prabhandham).toLowerCase();
      const azhwarNorm = removeDiacritics(item.azhwar).toLowerCase();
      return prabhandhamNorm.includes(queryNorm) || azhwarNorm.includes(queryNorm);
    });
  }, [data, searchQuery]);

  return (
    <SafeAreaView className="flex-1 bg-main">
      <Text className="text-3xl font-bold text-text-primary text-center my-5 font-serif tracking-[0.03125rem]">
        Prabhandha Mālai
      </Text>

      {/* Quick Search bar */}
      <View className="mx-4 mb-4 flex-row items-center bg-surface border border-border-color rounded-xl px-3.5 h-11">
        <Ionicons name="search" size={18} color={colors.tabIconDefault} className="mr-2" />
        <TextInput
          className="flex-1 text-text-primary text-sm p-0"
          placeholder="Quick search by name or Āḻvār..."
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

      <View className="flex-1 relative">
        <FlatList
          data={filteredData}
          keyExtractor={(item, i) => `${item.prabhandham}-${i}`}
          contentContainerClassName="px-4 pt-[1.125rem] pb-[6.875rem]"
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Card item={item} onPress={handleCardPress} />
          )}
          ListEmptyComponent={
            loading ? null : (
              <Text className="text-text-muted text-center mt-[3.75rem] text-base">
                {searchQuery ? 'No matching prabhandhams found.' : 'No prabhandhams found.'}
              </Text>
            )
          }
        />

        {/* Gradient fade at the top — blends into title area */}
        <LinearGradient
          colors={[colors.main, `${colors.main}8C`, 'transparent']}
          className="absolute top-0 left-0 right-0 h-9 z-[1]"
          pointerEvents="none"
        />

        {/* Gradient fade at the bottom — blends into navbar */}
        <LinearGradient
          colors={['transparent', `${colors.main}D9`, colors.main]}
          className="absolute bottom-0 left-0 right-0 h-20 z-[1]"
          pointerEvents="none"
        />
      </View>
    </SafeAreaView>
  );
}
