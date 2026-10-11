import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
    FlatList,
    Text,
    TouchableOpacity,
    View,
    TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GeneralItem, ItemRow } from './item-row';


type GeneralListProps = {
    title: string;
    category: 'acharyas' | 'alwars' | 'divya-deshams';
    fetchList: () => Promise<GeneralItem[]>;
};

const removeDiacritics = (str: string): string => {
    try {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    } catch (e) {
        return str;
    }
};



export default function GeneralList({ title, category, fetchList }: GeneralListProps) {
    const { colorScheme } = useColorScheme();
    const colors = Colors[colorScheme ?? "dark"];

    const router = useRouter();
    const [items, setItems] = useState<GeneralItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchList()
            .then((rows) => setItems(rows as GeneralItem[]))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [fetchList]);

    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) return items;
        const queryNorm = removeDiacritics(searchQuery).toLowerCase();
        return items.filter((item) => {
            const nameNorm = removeDiacritics(item.name).toLowerCase();
            return nameNorm.includes(queryNorm);
        });
    }, [items, searchQuery]);

    const handleItemPress = useCallback(
        (id: number) => {
            router.push({
                pathname: '/general-info' as any,
                params: { id: String(id), category },
            });
        },
        [router, category]
    );

    return (
        <SafeAreaView className="flex-1 bg-main">
            {/* Header */}
            <View className="px-5 pt-2.5 pb-1.5">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="flex-row items-center mb-4"
                >
                    <Ionicons name="chevron-back" size={20} color={colors.accent} />
                    <Text className="text-accent text-[0.9375rem] ml-1 font-semibold">
                        Back
                    </Text>
                </TouchableOpacity>
                <Text
                    className="text-text-primary text-[1.75rem] font-bold font-serif mb-1"
                    numberOfLines={2}
                >
                    {title}
                </Text>
                <Text className="text-text-muted text-[0.8125rem] mb-1">
                    {filteredItems.length} {filteredItems.length === 1 ? 'entry' : 'entries'} {searchQuery.trim() ? '(filtered)' : ''}
                </Text>

                {/* Quick Search bar */}
                <View className="flex-row items-center mt-2 gap-2">
                    <View className="flex-1 flex-row items-center bg-surface border border-border-color rounded-xl px-3.5 h-11">
                        <Ionicons name="search" size={18} color={colors.tabIconDefault} className="mr-2" />
                        <TextInput
                            className="flex-1 text-text-primary text-sm p-0"
                            placeholder={`Quick search ${title.toLowerCase()}...`}
                            placeholderTextColor={colors.tabIconDefault}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')} className="p-1">
                                <Ionicons name="close-circle" size={16} color={colors.textMuted} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {category === 'divya-deshams' && (
                        <TouchableOpacity
                            onPress={() => router.push('/nearby-divya-deshams')}
                            className="w-11 h-11 rounded-xl bg-surface border border-border-color items-center justify-center"
                            activeOpacity={0.72}
                        >
                            <Ionicons name="compass" size={20} color={colors.accent} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Divider */}
            <View className="h-px bg-border-color mx-5 mb-2" />

            <View className="flex-1">
                <FlatList
                    data={filteredItems}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerClassName="px-4 pt-2 pb-[7.5rem]"
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <ItemRow item={item} onPress={handleItemPress} />
                    )}
                    ListEmptyComponent={
                        loading ? null : (
                            <View className="items-center mt-20">
                                <Ionicons name="list-outline" size={48} color={colors.surfaceAlt} />
                                <Text className="text-text-muted mt-4 text-[0.9375rem]">
                                    {searchQuery ? 'No matching entries found.' : 'No entries found.'}
                                </Text>
                            </View>
                        )
                    }
                />

                {/* Bottom gradient */}
                <LinearGradient
                    colors={['transparent', 'rgba(24,26,31,0.9)', '#181A1F']}
                    className="absolute bottom-0 left-0 right-0 h-20"
                    pointerEvents="none"
                />
            </View>
        </SafeAreaView>
    );
}
