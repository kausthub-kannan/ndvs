import React from 'react';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/theme';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

export default function FavoritesScreen() {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];

  return (
    <SafeAreaView className="flex-1 bg-main">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        <Text className="text-3xl font-bold text-text-primary my-5 font-serif text-center">Favorites</Text>

        <View className="items-center justify-center mt-20 gap-[0.9375rem]">
          <MaterialIcons name="star-border" size={64} color={colors.icon} />
          <Text className="text-text-primary text-xl font-bold font-serif">No Favorites Yet</Text>
          <Text className="text-text-muted text-sm text-center px-[1.875rem]">Mark verses or hymns as favorites to see them here.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
