import { Stack } from 'expo-router';
import React from 'react';
import FilesViewerNav from '../../../components/file-viewer-nav';
import { DarkBlueTheme } from '../../../style/theme';
import DrawerButton from '../../../components/drawer-button';
import { StyleSheet } from 'react-native';
import HeaderBack from '../../../components/header-back';

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
          headerLeft: () => <DrawerButton />,
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
          headerLeft: () => <HeaderBack />,
          headerRight: FilesViewerNav,
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  drawerButton: {
    marginLeft: -10, // Adjust this value as needed
  },
});
