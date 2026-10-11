import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useColors } from '@/hooks/use-colors';

interface MapEmbedProps {
  lat: number;
  lng: number;
  placeName: string;
}

export default function MapEmbed({ lat, lng, placeName }: MapEmbedProps) {
  const colors = useColors();

  const openMaps = () => {
    const url = Platform.select({
      ios: `maps://?q=${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}`,
      default: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    });
    Linking.openURL(url).catch((err) => console.error("Error opening maps", err));
  };

  return (
    <View className="mt-2 border border-border-color rounded-2xl overflow-hidden bg-surface shadow-sm">
      <TouchableOpacity 
        onPress={openMaps} 
        activeOpacity={0.85} 
        className="p-5 flex-row items-center justify-between"
      >
        <View className="flex-row items-center flex-1 pr-4">
          <View 
            className="w-12 h-12 rounded-full items-center justify-center mr-4"
            style={{ backgroundColor: `${colors.accent}15` }}
          >
            <Ionicons name="location" size={24} color={colors.accent} />
          </View>
          <View className="flex-1">
            <Text className="text-text-primary font-bold text-base mb-0.5">
              {placeName}
            </Text>
            <Text className="text-text-muted text-xs font-mono">
              {lat.toFixed(6)}, {lng.toFixed(6)}
            </Text>
          </View>
        </View>
        <View 
          className="px-4 py-2.5 rounded-xl flex-row items-center gap-1.5"
          style={{ backgroundColor: colors.accent }}
        >
          <Text className="text-white text-xs font-bold">Open Maps</Text>
          <Ionicons name="open-outline" size={14} color="#FFF" />
        </View>
      </TouchableOpacity>
    </View>
  );
}
