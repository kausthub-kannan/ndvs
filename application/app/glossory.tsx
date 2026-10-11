import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getGlossaryList } from '@/database/glossary';
import { useColors } from '@/hooks/use-colors';

type GlossaryItem = {
  word: string;
  definition: string;
};

export default function GlossaryScreen() {
  const router = useRouter();
  const colors = useColors();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GlossaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchGlossary = useCallback((searchTerm: string) => {
    setLoading(true);
    getGlossaryList(searchTerm)
      .then((rows) => setResults(rows as GlossaryItem[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchGlossary(query);
    }, 400);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query, fetchGlossary]);

  return (
    <SafeAreaView className="flex-1 bg-main">
      <View className="px-5 pt-2.5 pb-2">
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center mb-4">
          <Ionicons name="chevron-back" size={20} color={colors.accent} />
          <Text className="text-accent text-[0.9375rem] ml-1 font-semibold">Back</Text>
        </TouchableOpacity>
        <Text className="text-text-primary text-[1.75rem] font-bold font-serif mb-1">Glossary</Text>
        <Text className="text-text-muted text-[0.8125rem] mb-2">Dictionary of terms</Text>
      </View>

      <View className="px-5 mb-4">
        <View className="flex-row items-center bg-surface border border-border-color rounded-2xl px-4 h-14">
          <MaterialIcons name="search" size={24} color={colors.textMuted} className="mr-2" />
          <TextInput
            className="flex-1 text-text-primary text-base"
            placeholder="Search words..."
            placeholderTextColor={colors.tabIconDefault}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} className="p-2">
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View className="h-px bg-border-color mx-5 mb-2" />

      <View className="flex-1">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item, index) => `${item.word}-${index}`}
            contentContainerClassName="px-5 pt-2 pb-[6.25rem]"
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View className="bg-surface rounded-xl mb-3 py-4 px-5 border border-border-color">
                <Text className="text-accent text-base font-bold tracking-[0.03125rem] uppercase mb-1.5">{item.word}</Text>
                <Text className="text-text-primary text-[0.9375rem] leading-[1.5rem]">{item.definition}</Text>
              </View>
            )}
            ListEmptyComponent={
              <View className="items-center mt-20">
                <Ionicons name="book-outline" size={48} color={colors.surfaceAlt} />
                <Text className="text-text-muted mt-4 text-[0.9375rem]">No words found.</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
