import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { DarkBlueTheme } from '../../../style/theme';
import DrawerButton from '../../../components/drawer-button';
import HeaderBack from '../../../components/header-back';
import DetailsNav from '../../../components/details-nav';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function VmLayout() {
  return <VmLayoutNav />;
}

function VmLayoutNav() {
  // TODO: headerLeft is slightly off alignment on left side
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
          headerLeft: () => <DrawerButton />,
        }}
      />
      <Stack.Screen
        name="menu"
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: DarkBlueTheme.colors.background,
          },
          headerLeft: () => <HeaderBack />,
          title: 'Menu',
        }}
      />
      <Stack.Screen
        name="details"
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: DarkBlueTheme.colors.background,
          },
          headerLeft: () => <HeaderBack />,
          headerRight: DetailsNav,
          title: 'Details',
        }}
      />
      <Stack.Screen
        name="logs"
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: DarkBlueTheme.colors.background,
          },
          headerLeft: () => <HeaderBack />,
          title: 'Logs',
        }}
      />
    </Stack>
  );
}
