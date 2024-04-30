import { Stack } from 'expo-router';
import React from 'react';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function AddServerLayout() {
  return <AddServerLayoutNav />;
}

function AddServerLayoutNav() {
  return (
    <Stack>
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
