import { Stack } from 'expo-router';
import React from 'react';
import { DarkBlueTheme } from '../../style/theme';
import HeaderBack from '../../components/header/header-back';
import DrawerButton from '../../components/header/drawer-button';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function SettingsLayout() {
  return <SettingsLayoutNav />;
}

function SettingsLayoutNav() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          headerLeft: () => <DrawerButton />,
          headerStyle: {
            backgroundColor: DarkBlueTheme.colors.background,
          },
          title: 'Settings',
        }}
      />
      <Stack.Screen
        name="info"
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: DarkBlueTheme.colors.background,
          },
          headerLeft: () => <HeaderBack />,
          title: 'App Info',
        }}
      />
      <Stack.Screen
        name="app"
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: DarkBlueTheme.colors.background,
          },
          headerLeft: () => <HeaderBack />,
          title: 'App Settings',
        }}
      />
      <Stack.Screen
        name="tabs"
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: DarkBlueTheme.colors.background,
          },
          headerLeft: () => <HeaderBack />,
          title: 'Tabs',
        }}
      />
    </Stack>
  );
}
