import { Tabs, useRouter } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  const router = useRouter();
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
    </Tabs>
  );
}
