import { Stack } from 'expo-router';
import React from 'react';

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
      <Stack.Screen name="list" options={{ headerShown: false }} />
      <Stack.Screen name="menu" options={{ headerShown: false }} />
    </Stack>
  );
}
