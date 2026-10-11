import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useColors } from '@/hooks/use-colors';

export default function Navbar({ state, descriptors, navigation }: BottomTabBarProps) {
    const colors = useColors();

    // Only render tabs that have a tabBarIcon (visible tabs — hidden routes won't have one)
    const visibleRoutes = state.routes.filter((route) => {
        const { options } = descriptors[route.key];
        return options.tabBarIcon !== undefined;
    });

    return (
        <View className="flex-row border-t-0 h-[3.75rem] items-center justify-around absolute bottom-0 left-2.5 right-2.5 mb-6 rounded-2xl elevation-none bg-surface-alt">
            {visibleRoutes.map((route) => {
                const { options } = descriptors[route.key];
                const isFocused = state.index === state.routes.indexOf(route);

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name, route.params);
                    }
                };

                const onLongPress = () => {
                    navigation.emit({
                        type: 'tabLongPress',
                        target: route.key,
                    });
                };

                const color = isFocused ? colors.accent : colors.icon;

                return (
                    <TouchableOpacity
                        key={route.key}
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        testID={options.tabBarButtonTestID}
                        onPress={onPress}
                        onLongPress={onLongPress}
                        className="flex-1 items-center justify-center h-full"
                    >
                        {options.tabBarIcon && options.tabBarIcon({
                            focused: isFocused,
                            color: color,
                            size: 28,
                        })}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

