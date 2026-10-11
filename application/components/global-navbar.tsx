import Feather from '@expo/vector-icons/Feather';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useColors } from '@/hooks/use-colors';

type Tab = {
  name: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  route: string;
};

const TABS: Tab[] = [
  { name: 'settings',     icon: 'settings', route: '/(tabs)/settings' },
  { name: 'search',      icon: 'search',   route: '/(tabs)/search' },
  { name: 'index',       icon: 'home',     route: '/(tabs)/' },
  { name: 'prabhandham', icon: 'book',     route: '/(tabs)/prabhandham' },
  { name: 'bookmarks',   icon: 'heart',    route: '/(tabs)/bookmarks' },
];

export default function GlobalNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const colors = useColors();

  // Determine which tab is "active" based on current pathname
  const getActiveTab = () => {
    if (pathname === '/' || pathname === '/index') return 'index';
    // Strip leading slash and (tabs)/ prefix if present
    const clean = pathname.replace(/^\/\(tabs\)\//, '').replace(/^\//, '');
    return clean || 'index';
  };

  const activeTab = getActiveTab();

  return (
    <View
      className="absolute bottom-6 left-2.5 right-2.5 h-[3.75rem] flex-row items-center justify-around rounded-2xl bg-surface"
      style={{
        // Shadow for Android
        elevation: 8,
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      }}
    >
      {TABS.map((tab) => {
        const isFocused = activeTab === tab.name;
        const color = isFocused ? colors.accent : colors.icon;
        const iconSize = 28 * 0.85;

        return (
          <TouchableOpacity
            key={tab.name}
            onPress={() => router.push(tab.route as any)}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            className="flex-1 items-center justify-center h-full"
          >
            <Feather name={tab.icon} size={iconSize} color={color} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
