import { Stack } from 'expo-router';
import React from 'react';
import { DockerContainerProvider } from '../../../contexts/DockerContainer';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function DockerLayout() {
  return <DockerLayoutNav />;
}

function DockerLayoutNav() {
  return (
    <DockerContainerProvider>
      <Stack>
        <Stack.Screen
          name="list"
          options={{ headerShown: true, title: 'Docker' }}
        />
        <Stack.Screen name="menu" options={{ headerShown: true }} />
        <Stack.Screen name="json" options={{ headerShown: true }} />
        <Stack.Screen name="logs" options={{ headerShown: true }} />
      </Stack>
    </DockerContainerProvider>
  );
}
