import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export function PrefRow({
  icon,
  label,
  value,
  control,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  control: React.ReactNode;
  onPress?: () => void;
}) {
  const Inner = (
    <View className="flex-row items-center bg-surface py-3.5 px-4 rounded-2xl justify-between">
      <View className="flex-row items-center gap-3.5">
        {icon}
        <View className="gap-0.5">
          <Text className="text-text-muted text-[0.6875rem] uppercase tracking-[0.03125rem]">{label}</Text>
          <Text className="text-text-primary text-[0.9375rem] font-bold mt-0.5">{value}</Text>
        </View>
      </View>
      {control}
    </View>
  );
  if (onPress) {
    return <TouchableOpacity onPress={onPress} activeOpacity={0.75}>{Inner}</TouchableOpacity>;
  }
  return Inner;
}
