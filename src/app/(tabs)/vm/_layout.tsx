import { Stack } from 'expo-router';
import React from 'react';
import Exit from '../../../components/exit-button';
import { DarkBlueTheme } from '../../../style/theme';
import { Menu } from '@tamagui/lucide-icons';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function VmLayout() {
  return <VmLayoutNav />;
}

function VmLayoutNav() {
  return (
    <Stack>
      <Stack.Screen
        name="list"
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: DarkBlueTheme.colors.background,
          },
          title: 'VMs',
          headerLeft: () => <Menu />,
          headerRight: Exit,
        }}
      />
      <Stack.Screen
        name="menu"
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: DarkBlueTheme.colors.background,
          },
          title: 'Menu',
          headerRight: Exit,
        }}
      />
      <Stack.Screen
        name="details"
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: DarkBlueTheme.colors.background,
          },
          title: 'Details',
          headerRight: Exit,
        }}
      />
      <Stack.Screen
        name="logs"
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: DarkBlueTheme.colors.background,
          },
          title: 'Logs',
          headerRight: Exit,
        }}
      />
    </Stack>
  );
}
