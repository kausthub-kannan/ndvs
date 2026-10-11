import React from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type Pasuram = {
  id: number;
  si_no: number;
  prabhandham: string;
  tamil_scripts: string;
  english_scripts: string;
  azhwar: string;
  bookmark: number;
};

import { HeartButton } from './pasuram-heart-button';

export function PasuramRow({
  item,
  language,
  showFullLyrics,
  onBookmarkToggle,
  onPress,
}: {
  item: Pasuram;
  language: 'english' | 'tamil';
  showFullLyrics: boolean;
  onBookmarkToggle: (id: number, current: number) => void;
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
      {/* Text content fills the row */}
      <View className="flex-1">
        <Text
          className="text-text-muted text-[0.6875rem] font-semibold tracking-[0.03125rem] mb-1 uppercase"
        >
          {item.si_no}
        </Text>
        <Text
          className="text-text-primary text-[0.9375rem] leading-[1.375rem] font-serif"
          numberOfLines={showFullLyrics ? undefined : 2}
        >
          {displayText.replace(/\\/g, '')}
        </Text>
      </View>

      {/* Heart pinned to the right */}
      <View className="ml-3">
        <HeartButton
          bookmarked={item.bookmark === 1}
          onToggle={() => onBookmarkToggle(item.id, item.bookmark)}
        />
      </View>
    </TouchableOpacity>
  );
}
