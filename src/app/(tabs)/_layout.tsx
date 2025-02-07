import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { DarkBlueTheme } from '../../style/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'grey',
        tabBarActiveBackgroundColor: DarkBlueTheme.colors.background,
        tabBarInactiveBackgroundColor: DarkBlueTheme.colors.background,
        tabBarBackground: () => <></>,
      }}
      initialRouteName="docker"
    >
      <Tabs.Screen
        name="docker"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'logo-docker' : 'logo-docker'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="vm"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'desktop-outline' : 'desktop-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="files"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'folder-outline' : 'folder-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
