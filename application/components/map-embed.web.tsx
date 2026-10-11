import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';

interface MapEmbedProps {
  lat: number;
  lng: number;
  placeName: string;
}

export default function MapEmbed({ lat, lng, placeName }: MapEmbedProps) {
  const openMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(url).catch((err) => console.error("Error opening maps", err));
  };

  return (
    <View className="mt-2 border border-border-color rounded-2xl overflow-hidden bg-surface shadow-sm">
      <View className="p-4 flex-row items-center justify-between border-b border-border-color bg-surface">
        <View className="flex-row items-center gap-2">
          <Ionicons name="map-outline" size={20} color="#E11D48" />
          <Text className="text-text-primary font-bold text-sm">Location Map</Text>
        </View>
        <TouchableOpacity onPress={openMaps} className="bg-accent/10 px-3 py-1 rounded-full">
          <Text className="text-accent text-xs font-semibold">Open in Maps</Text>
        </TouchableOpacity>
      </View>
      <View className="w-full h-[180px]">
        <iframe
          src={`https://maps.google.com/maps?q=${lat},${lng}&z=14&output=embed`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
        />
      </View>
    </View>
  );
}
