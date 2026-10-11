import React from 'react';
import { Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function HeartButton({
  bookmarked,
  onToggle,
}: {
  bookmarked: boolean;
  onToggle: () => void;
}) {
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.35, useNativeDriver: true, speed: 40, bounciness: 12 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }),
    ]).start();
    onToggle();
  };

  return (
    <TouchableOpacity onPress={handlePress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons
          name={bookmarked ? 'heart' : 'heart-outline'}
          size={20}
          color={bookmarked ? '#E85D75' : '#6B7280'}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}
