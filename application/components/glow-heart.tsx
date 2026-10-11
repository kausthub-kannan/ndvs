import { useColors } from '@/hooks/use-colors';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity } from 'react-native';

export function GlowHeart({ bookmarked, onToggle }: { bookmarked: boolean; onToggle: () => void }) {
  const colors = useColors();
  const scale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(bookmarked ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(glowOpacity, {
      toValue: bookmarked ? 1 : 0,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [bookmarked]);

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.4, useNativeDriver: true, speed: 50, bounciness: 14 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }),
    ]).start();
    onToggle();
  };

  return (
    <TouchableOpacity onPress={handlePress} hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Animated.View
          className="absolute -top-1.5 -left-1.5 -right-1.5 -bottom-1.5 rounded-3xl bg-danger"
          style={{ opacity: Animated.multiply(glowOpacity, 0.3) }}
        />
        <Ionicons
          name={bookmarked ? 'heart' : 'heart-outline'}
          size={28}
          color={bookmarked ? colors.danger : colors.tabIconDefault}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}
