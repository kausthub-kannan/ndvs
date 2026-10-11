import { Tabs } from 'expo-router';
import React from 'react';
import Feather from '@expo/vector-icons/Feather';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={() => null}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size * 0.85} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="settings" size={size * 0.85} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="search" size={size * 0.85} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="prabhandham"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="book" size={size * 0.85} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="heart" size={size * 0.85} color={color} />
          ),
        }}
      />

      {/* Hidden routes moved to root Stack for proper back navigation */}
    </Tabs>
  );
}
