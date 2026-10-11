import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export type GeneralItem = {
    id: number;
    name: string;
};

export function ItemRow({
    item,
    onPress,
}: {
    item: GeneralItem;
    onPress: (id: number) => void;
}) {
    const { colorScheme } = useColorScheme();
    const colors = Colors[colorScheme ?? "dark"];
    return (
        <TouchableOpacity
            onPress={() => onPress(item.id)}
            activeOpacity={0.72}
            className="flex-row items-center bg-surface rounded-xl mb-2.5 py-4 px-[1.125rem] border border-border-color"
        >
            <View className="flex-1">
                <Text
                    className="text-text-primary text-[1.0625rem] font-semibold font-serif"
                    numberOfLines={2}
                >
                    {item.name}
                </Text>
            </View>

            <View className="ml-3">
                <Ionicons name="chevron-forward" size={18} color={colors.tabIconDefault} />
            </View>
        </TouchableOpacity>
    );
}
