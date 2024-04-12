import { Stack } from 'expo-router';
import React from 'react';
import root from '../../../components/root-button';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function FilesLayout() {
  return <FilesLayoutNav />;
}

function FilesLayoutNav() {
  return (
    <Stack>
      <Stack.Screen
        name="viewer"
        options={{ headerShown: true, title: 'Files', headerRight: root }}
      />
    </Stack>
  );
}
