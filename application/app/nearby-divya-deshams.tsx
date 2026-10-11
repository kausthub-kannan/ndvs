import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/hooks/use-colors';
import { getDivyaDeshamsWithCoords, DivyaDeshamCoordsItem } from '@/database/divya-desham';

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

const parseCoordinates = (coordStr: string) => {
  if (!coordStr) return null;
  const parts = coordStr.split(',');
  if (parts.length !== 2) return null;
  const lat = parseFloat(parts[0].trim());
  const lng = parseFloat(parts[1].trim());
  if (isNaN(lat) || isNaN(lng)) return null;
  return { lat, lng };
};

const formatDistance = (dist: number) => {
  if (dist < 1) {
    return `${Math.round(dist * 1000)} m`;
  }
  return `${dist.toFixed(1)} km`;
};

export default function NearbyDivyaDeshamsScreen() {
  const router = useRouter();
  const colors = useColors();

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [maxDistance, setMaxDistance] = useState<number>(40);
  const [inputValue, setInputValue] = useState<string>('40');
  const [divyaDeshams, setDivyaDeshams] = useState<DivyaDeshamCoordsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Keep manual text input value in sync when maxDistance is updated via stepper +/-
  useEffect(() => {
    setInputValue(String(maxDistance));
  }, [maxDistance]);

  const handleInputChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setInputValue(cleaned);
  };

  const handleTextSubmit = () => {
    const parsed = parseInt(inputValue, 10);
    if (!isNaN(parsed) && parsed >= 1) {
      setMaxDistance(parsed);
    } else {
      setInputValue(String(maxDistance));
    }
  };

  const fetchLocationAndData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setErrorMsg(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Location permission is required to find nearby temples. Please enable permissions in your device settings.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(loc);

      const list = await getDivyaDeshamsWithCoords();
      setDivyaDeshams(list);
    } catch (e) {
      console.error(e);
      setErrorMsg('Failed to determine your location. Please check if your GPS is turned on and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLocationAndData();
  }, [fetchLocationAndData]);

  // Calculate and sort by distance
  const nearbyList = useMemo(() => {
    if (!location) return [];
    const userLat = location.coords.latitude;
    const userLng = location.coords.longitude;

    return divyaDeshams
      .map((item) => {
        const coords = parseCoordinates(item.coordinates);
        if (!coords) return null;
        const distance = getDistance(userLat, userLng, coords.lat, coords.lng);
        return { ...item, distance };
      })
      .filter((item): item is (DivyaDeshamCoordsItem & { distance: number }) => item !== null)
      .sort((a, b) => a.distance - b.distance);
  }, [divyaDeshams, location]);

  // Filter based on max distance
  const filteredList = useMemo(() => {
    return nearbyList.filter((item) => item.distance <= maxDistance);
  }, [nearbyList, maxDistance]);

  const handleAdjustDistance = (amount: number) => {
    setMaxDistance((prev) => Math.max(10, prev + amount));
  };

  const handleItemPress = (id: number) => {
    router.push({
      pathname: '/general-info',
      params: { id: String(id), category: 'divya-deshams' },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-main">
      {/* Top Bar */}
      <View className="px-[1.125rem] py-2.5">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={22} color={colors.accent} />
          <Text className="text-accent text-[0.9375rem] font-semibold ml-0.5">Back</Text>
        </TouchableOpacity>
      </View>

      {/* Main Body */}
      {loading ? (
        <View className="flex-1 items-center justify-center bg-main">
          <ActivityIndicator size="large" color={colors.accent} />
          <Text className="text-text-muted mt-4 text-sm font-medium">Determining location...</Text>
        </View>
      ) : errorMsg ? (
        <View className="flex-1 items-center justify-center p-6 bg-main">
          <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
          <Text className="text-text-primary font-bold text-lg mt-4 text-center">Location Error</Text>
          <Text className="text-text-muted text-sm text-center mt-2 mb-6 leading-[1.25rem]">{errorMsg}</Text>
          <TouchableOpacity
            onPress={() => fetchLocationAndData()}
            className="px-6 py-3 rounded-xl"
            style={{ backgroundColor: colors.accent }}
          >
            <Text className="text-white font-bold text-sm">Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="flex-1 relative">
          <FlatList
            data={filteredList}
            keyExtractor={(item) => String(item.id)}
            contentContainerClassName="pb-24"
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={() => fetchLocationAndData(true)}
            ListHeaderComponent={
              <View>
                {/* Title Block */}
                <View className="px-5 mb-[1.125rem]">
                  <Text className="text-accent text-[0.8125rem] font-bold tracking-[0.075rem] uppercase mb-1.5">
                    108 Divya Deśams
                  </Text>
                  <Text
                    style={{ fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }) }}
                    className="text-text-primary text-[1.75rem] font-bold tracking-[0.0125rem]"
                  >
                    Divya Deśams near me
                  </Text>
                </View>

                {/* Distance Filter Controls */}
                <View className="bg-surface p-5 border-b border-border-color shadow-sm mb-4 mx-5 rounded-2xl border">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-text-muted text-[0.6875rem] font-bold tracking-[0.0875rem] uppercase">
                      Search Range
                    </Text>
                    
                    <TouchableOpacity
                      onPress={() => fetchLocationAndData(true)}
                      className="flex-row items-center gap-1 bg-accent/10 px-3 py-1.5 rounded-full"
                      disabled={loading || refreshing}
                    >
                      <Ionicons name="refresh" size={12} color={colors.accent} />
                      <Text className="text-accent text-xs font-semibold">Reload Location</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Stepper Control */}
                  <View className="flex-row items-center justify-between mt-4">
                    <TouchableOpacity
                      onPress={() => handleAdjustDistance(-10)}
                      className="w-12 h-12 rounded-full bg-main border border-border-color items-center justify-center"
                    >
                      <Ionicons name="remove" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>

                    <View className="flex-row items-center justify-center gap-1.5 flex-1 mx-4">
                      <TextInput
                        className="text-accent text-2xl font-bold font-mono text-center min-w-[60px] p-0"
                        value={inputValue}
                        onChangeText={handleInputChange}
                        onBlur={handleTextSubmit}
                        onSubmitEditing={handleTextSubmit}
                        keyboardType="number-pad"
                        selectTextOnFocus={true}
                        maxLength={5}
                        returnKeyType="done"
                      />
                      <Text className="text-text-muted text-base font-semibold">km</Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleAdjustDistance(10)}
                      className="w-12 h-12 rounded-full bg-main border border-border-color items-center justify-center"
                    >
                      <Ionicons name="add" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="px-5 py-3 bg-main border-b border-border-color flex-row justify-between items-center mb-3">
                  <Text className="text-text-muted text-[0.6875rem] font-bold tracking-[0.0875rem] uppercase">
                    Temples Found
                  </Text>
                  <Text className="text-text-muted text-xs font-bold">
                    {filteredList.length} of {nearbyList.length}
                  </Text>
                </View>
              </View>
            }
            renderItem={({ item }) => (
              <View className="px-5">
                <TouchableOpacity
                  onPress={() => handleItemPress(item.id)}
                  activeOpacity={0.72}
                  className="flex-row items-center bg-surface rounded-xl mb-2.5 py-4 px-[1.125rem] border border-border-color"
                >
                  <View className="flex-1 pr-3">
                    <Text className="text-text-primary text-[1.0625rem] font-semibold font-serif mb-0.5">
                      {item.name}
                    </Text>
                    <Text className="text-text-muted text-[0.75rem] font-medium">
                      {item.place}, {item.state}
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <View
                      className="px-2.5 py-1.5 rounded-lg mr-2"
                      style={{ backgroundColor: `${colors.accent}15` }}
                    >
                      <Text
                        className="text-xs font-bold font-mono"
                        style={{ color: colors.accent }}
                      >
                        {formatDistance(item.distance)}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.tabIconDefault} />
                  </View>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <View className="items-center mt-12 px-6">
                <Ionicons name="compass-outline" size={48} color={colors.surfaceAlt} />
                <Text className="text-text-primary font-bold text-base mt-4 text-center">
                  No Temples Nearby
                </Text>
                <Text className="text-text-muted text-sm text-center mt-2 leading-[1.25rem]">
                  No Divya Deshams found within {maxDistance} km. Try increasing the search range or reloading.
                </Text>
              </View>
            }
          />

          {/* Bottom gradient */}
          <LinearGradient
            colors={['transparent', `${colors.main}CC`, colors.main]}
            className="absolute bottom-0 left-0 right-0 h-[5.625rem]"
            pointerEvents="none"
          />
        </View>
      )}
    </SafeAreaView>
  );
}
