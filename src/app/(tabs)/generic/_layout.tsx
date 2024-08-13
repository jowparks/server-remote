import { Stack } from 'expo-router';
import React from 'react';
import { DarkBlueTheme } from '../../../style/theme';
import { StyleSheet } from 'react-native';
import HeaderBack from '../../../components/header/header-back';
import FilesViewerNav from '../../../components/nav/file-viewer-nav';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function GenericLayout() {
  return <GenericLayoutNav />;
}
// TODO make name/subheading fields dynamic relative to searchResponse
// TODO handle errors with headerback triggering incorrectly
function GenericLayoutNav() {
  return (
    <Stack>
      <Stack.Screen
        name="template"
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: DarkBlueTheme.colors.background,
          },
          headerBackTitleVisible: false,
          title: '',
          headerLeft: () => <HeaderBack />,
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
