import { getBookmarkedPasurams, toggleBookmark } from '@/database/prabhandham';
import { PasuramListItem } from '@/database/utils/db';
import { useLanguage } from '@/context/language-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useColors } from '@/hooks/use-colors';
import { BookmarkRow } from '@/components/bookmark-row';

type Pasuram = PasuramListItem;



export default function BookmarksScreen() {
  const router = useRouter();
  const { language, showFullLyrics } = useLanguage();
  const colors = useColors();
  const [bookmarks, setBookmarks] = useState<Pasuram[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookmarks = useCallback(() => {
    setLoading(true);
    getBookmarkedPasurams()
      .then((rows) => setBookmarks(rows as Pasuram[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Refresh every time the tab comes into focus
  useFocusEffect(
    useCallback(() => {
      loadBookmarks();
    }, [loadBookmarks])
  );

  const handleRemove = useCallback(async (id: number) => {
    await toggleBookmark(id, 1);
    setBookmarks((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handlePress = useCallback((id: number) => {
    router.push({ pathname: '/pasuram', params: { id: String(id) } });
  }, [router]);

  return (
    <SafeAreaView className="flex-1 bg-main">
      {/* Header */}
      <View className="px-5 pt-2.5 pb-3.5">
        <Text
          className="text-text-primary text-4xl font-bold font-serif text-center mt-2 mb-1"
        >
          Bookmarks
        </Text>
        {bookmarks.length > 0 && (
          <Text className="text-text-muted text-[0.8125rem] text-center">
            {bookmarks.length} saved pasuram{bookmarks.length !== 1 ? 's' : ''}
          </Text>
        )}
      </View>

      {/* Divider */}
      <View className="h-px bg-border-color mx-5 mb-2" />

      <View className="flex-1">
        <FlatList
          data={bookmarks}
          keyExtractor={(item) => String(item.id)}
          contentContainerClassName="px-4 pt-2 pb-[7.5rem]"
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <BookmarkRow
              item={item}
              language={language}
              showFullLyrics={showFullLyrics}
              onRemove={handleRemove}
              onPress={handlePress}
            />
          )}
          ListEmptyComponent={
            loading ? null : (
              <View className="items-center mt-20 gap-4">
                <Ionicons name="heart-outline" size={56} color={colors.borderColor} />
                <Text className="text-text-primary text-xl font-bold font-serif">
                  No Bookmarks Yet
                </Text>
                <Text
                  className="text-text-muted text-sm text-center px-10 leading-[1.375rem]"
                >
                  Tap the heart icon on any pasuram to bookmark it and find it here.
                </Text>
              </View>
            )
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
