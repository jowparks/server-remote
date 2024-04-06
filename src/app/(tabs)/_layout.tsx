import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'red',
      }}
      initialRouteName="docker"
    >
      <Tabs.Screen
        name="docker"
        options={{
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="vm"
        options={{
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="wiregaurd"
        options={{
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
