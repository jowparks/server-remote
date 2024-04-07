import { Stack } from 'expo-router';
import React from 'react';
import { VirshVmProvider } from '../../../contexts/virtual-machines';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function VmLayout() {
  return <VmLayoutNav />;
}

function VmLayoutNav() {
  return (
    <VirshVmProvider>
      <Stack>
        <Stack.Screen
          name="list"
          options={{ headerShown: true, title: 'VMs' }}
        />
        <Stack.Screen
          name="menu"
          options={{ headerShown: true, title: 'Menu' }}
        />
        <Stack.Screen
          name="details"
          options={{ headerShown: true, title: 'Details' }}
        />
        <Stack.Screen
          name="logs"
          options={{ headerShown: true, title: 'Logs' }}
        />
      </Stack>
    </VirshVmProvider>
  );
}
