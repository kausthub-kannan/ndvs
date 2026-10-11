import React from 'react';
import { Text, View } from 'react-native';

export function ToggleCard({
  caption,
  children,
}: {
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <View className="items-center gap-2">
      {children}
      <Text className="text-text-muted text-[0.6875rem] font-bold uppercase tracking-[0.0375rem]">
        {caption}
      </Text>
    </View>
  );
}
