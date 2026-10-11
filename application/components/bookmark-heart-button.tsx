import { useColors } from '@/hooks/use-colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Animated, TouchableOpacity } from 'react-native';

export function HeartButton({ onRemove }: { onRemove: () => void }) {
  const colors = useColors();
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.35, useNativeDriver: true, speed: 40, bounciness: 12 }),
      Animated.spring(scale, { toValue: 0, useNativeDriver: true, speed: 20 }),
    ]).start(() => {
      onRemove();
      scale.setValue(1);
    });
  };

  return (
    <TouchableOpacity onPress={handlePress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons name="heart" size={20} color={colors.danger} />
      </Animated.View>
    </TouchableOpacity>
  );
}
