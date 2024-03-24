import { Link, Tabs } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';
import { Text } from 'tamagui';

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
          title: 'Docker',
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                <Text>Hello!</Text>
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="vm"
        options={{
          title: 'VMs',
          tabBarIcon: ({ color }) => <Text>Hello!</Text>,
        }}
      />
    </Tabs>
  );
}
