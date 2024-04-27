import { Stack } from 'expo-router';
import React from 'react';
import Exit from '../../../components/exit-button';
import FilesViewerNav from '../../../components/file-viewer-nav';
import { DarkBlueTheme } from '../../../style/theme';

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
        name="paths"
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: DarkBlueTheme.colors.background,
          },
          title: 'Files',
          headerRight: Exit,
        }}
      />
      <Stack.Screen
        name="viewer"
        initialParams={{ path: '/' }}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: DarkBlueTheme.colors.background,
          },
          headerBackTitleVisible: false,
          title: 'Files',
          headerRight: FilesViewerNav,
        }}
      />
    </Stack>
  );
}
