import { useColors } from '@/hooks/use-colors';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';

export function PillToggle({
  active,
  onToggle,
  leftLabel,
  rightLabel,
  leftIcon,
  rightIcon,
}: {
  active: boolean;       // false = left, true = right
  onToggle: () => void;
  leftLabel?: string;
  rightLabel?: string;
  leftIcon?: React.ReactElement<{ color?: string }>;
  rightIcon?: React.ReactElement<{ color?: string }>;
}) {
  const colors = useColors();
  const translateX = React.useRef(new Animated.Value(active ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.spring(translateX, {
      toValue: active ? 1 : 0,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  }, [active]);

  const TRACK_W = 80;
  const THUMB_W = 36;
  const thumbTranslate = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: [0, TRACK_W - THUMB_W],
  });

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.85}>
      <View
        className="h-10 rounded-full justify-center relative"
        style={{
          width: TRACK_W,
          backgroundColor: active ? colors.accent : leftIcon ? colors.accent : colors.surfaceAlt,
        }}
      >
        {/* Side labels / icons */}
        <View className="absolute left-0 right-0 flex-row justify-between px-[0.5625rem]">
          <View style={{ opacity: active ? 0.35 : 1 }}>
            {leftIcon ?? <Text className="text-white text-xs font-bold">{leftLabel}</Text>}
          </View>
          <View style={{ opacity: active ? 1 : 0.35 }}>
            {rightIcon ?? <Text className="text-white text-xs font-bold">{rightLabel}</Text>}
          </View>
        </View>

        {/* Sliding thumb */}
        <Animated.View
          style={{
            position: 'absolute',
            width: THUMB_W,
            height: 36,
            borderRadius: 18,
            backgroundColor: isDark ? '#ffffff' : '#ece9e9ff',
            transform: [{ translateX: thumbTranslate }],
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: colors.main,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.18,
            shadowRadius: 3,
            elevation: 3,
          }}
        >
          {/* Show the active side's icon/label on the thumb */}
          {active
            ? (rightIcon
              ? React.cloneElement(rightIcon as React.ReactElement<{ color?: string }>, { color: colors.accent })
              : <Text className="text-accent text-xs font-bold">{rightLabel}</Text>)
            : (leftIcon
              ? React.cloneElement(leftIcon as React.ReactElement<{ color?: string }>, { color: colors.accent })
              : <Text className="text-accent text-xs font-bold">{leftLabel}</Text>)
          }
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
}
