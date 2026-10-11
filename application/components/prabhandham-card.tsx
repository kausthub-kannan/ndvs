import { getImageSource } from '@/components/general-info';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

export type PrabhandhamItem = {
  prabhandham: string;
  azhwar: string;
  pasuram_count: number;
};

export function Card({
  item,
  onPress,
}: {
  item: PrabhandhamItem;
  onPress: (prabhandham: string) => void;
}) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const imageSource = getImageSource('alwars', item.azhwar, isDark);

  return (
    <View className="mb-3 rounded-[0.875rem] overflow-hidden bg-surface border border-border-color">
      <TouchableOpacity
        className="flex-row items-center px-2 py-3 h-[6.3rem]"
        activeOpacity={0.75}
        onPress={() => onPress(item.prabhandham)}
      >
        <Image
          source={imageSource}
          className="w-[5.5rem] h-[5.5rem] rounded-[0.625rem] bg-surface"
          resizeMode="cover"
        />
        <View className="flex-1 ml-3.5 justify-center">
          <Text className="text-[1.0625rem] font-bold text-text-primary font-serif mb-0.5" numberOfLines={2}>
            {item.prabhandham}
          </Text>
          <Text className="text-[0.8125rem] text-text-muted italic mb-1">{item.azhwar}</Text>
          <Text className="text-xs text-text-muted font-semibold tracking-[0.01875rem]">
            {item.pasuram_count} Pasurams
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
