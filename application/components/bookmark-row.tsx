import { PasuramListItem } from '@/database/utils/db';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { HeartButton } from './bookmark-heart-button';

export function BookmarkRow({
  item,
  language,
  showFullLyrics,
  onRemove,
  onPress,
}: {
  item: PasuramListItem;
  language: 'english' | 'tamil';
  showFullLyrics: boolean;
  onRemove: (id: number) => void;
  onPress: (id: number) => void;
}) {
  const rawText = language === 'tamil' ? item.tamil_scripts : item.english_scripts;
  const displayText = showFullLyrics
    ? (rawText ?? '')
    : (rawText ? rawText.slice(0, 72) + (rawText.length > 72 ? '…' : '') : '');

  return (
    <TouchableOpacity
      onPress={() => onPress(item.id)}
      activeOpacity={0.72}
      className="flex-row items-center bg-surface rounded-xl mb-2.5 py-3.5 px-4 border border-border-color"
    >
      <View className="flex-1">
        <View className="flex-row items-center mb-1 gap-2">
          <Text
            className="text-accent text-[0.6875rem] font-bold tracking-[0.03125rem] uppercase"
          >
            {item.prabhandham}
          </Text>
          <Text className="text-text-muted text-[0.6875rem]">·</Text>
          <Text className="text-text-muted text-[0.6875rem]">{item.si_no}</Text>
        </View>
        <Text
          className="text-text-primary text-[0.9375rem] leading-[1.375rem] font-serif"
          numberOfLines={showFullLyrics ? undefined : 2}
        >
          {displayText}
        </Text>
        <Text className="text-text-muted text-xs mt-1">{item.azhwar}</Text>
      </View>
      <View className="ml-3">
        <HeartButton onRemove={() => onRemove(item.id)} />
      </View>
    </TouchableOpacity>
  );
}
