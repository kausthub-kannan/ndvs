import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/use-colors';

export default function AboutScreen() {
  const router = useRouter();
  const colors = useColors();

  return (
    <SafeAreaView className="flex-1 bg-main">
      <View className="px-5 pt-2.5 pb-2 border-b border-border-color">
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center mb-4">
          <Ionicons name="chevron-back" size={20} color={colors.accent} />
          <Text className="text-accent text-[0.9375rem] ml-1 font-semibold">Back</Text>
        </TouchableOpacity>
        <Text className="text-text-primary text-[1.75rem] font-bold font-serif mb-2">About</Text>
      </View>
      <ScrollView contentContainerClassName="p-5 pb-[6.25rem]">
        <Text className="text-text-primary text-base leading-[1.625rem]">
          Namahyāmāṃ Drāviḍa Veda Sāgaraṃ (NDVS) is a devotional initiative created to preserve, share, and celebrate the timeless outpourings of the Āḻvārs — twelve mystic poets who appeared by divine will at the close of the Dvāpara-yuga and the dawn of the Kali-yuga. Revered as incarnations of the Lord's eternal attendants (Nitya Sūris) such as Sudarśana, Kaustubha, Garuḍa, and others, the Āḻvārs composed the Divya Prabandham — a collection of 4,000 hymns in Tamil, widely hailed as the Drāviḍa Veda.
          {"\n\n"}In these hymns, the Āḻvārs poured out their love for Nārāyaṇa, describing His glory, compassion, and beauty, while singing of His sacred abodes. They sanctified 108 temples, known as Divya Deśams — foremost among them Śrīraṅgam, Tirumalai (Tirupati), and Kāñcipuram — enshrining them as eternal centers of pilgrimage and devotion.
          {"\n\n"}NDVS seeks to bring the nectar of these hymns to the modern world in accessible forms. The application offers English renderings of the Divya Prabandham, enabling seekers, students, and devotees to grasp the essence of all 4,000 pāsurams. With intuitive navigation, powerful search tools, and a mobile-friendly design, NDVS makes exploring the Āḻvārs' message easy, enriching, and spiritually elevating.
          {"\n\n"}The vision of NDVS is to serve as a bridge — connecting the profound Tamil hymns of the Āḻvārs to a global audience, while retaining their devotional depth and poetic splendor. Whether for study, prayer, or daily inspiration, NDVS offers a simple yet profound way to experience the eternal voice of the Āḻvārs.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
