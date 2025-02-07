import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { DarkBlueTheme } from '../../style/theme';
import { useTabs } from '../../contexts/tabs';

export default function TabLayout() {
  const { tabs } = useTabs();
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
          href: tabs.includes('docker') ? '/docker' : null,
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
          href: tabs.includes('vm') ? '/vm' : null,
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
          href: tabs.includes('files') ? '/files' : null,
        }}
      />
    </Tabs>
  );
}
