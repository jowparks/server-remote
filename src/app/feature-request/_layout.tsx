import { Stack } from 'expo-router';
import React from 'react';
import HeaderBack from '../../components/header/header-back';
import { DarkBlueTheme } from '../../style/theme';
import DrawerButton from '../../components/header/drawer-button';
import { FeatureRequestButton } from '../../components/feature-request/feature-request-button';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function FeatureRequest() {
  return <FeatureRequestNav />;
}

function FeatureRequestNav() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          headerLeft: () => <DrawerButton />,
          headerRight: () => <FeatureRequestButton />,
          headerStyle: {
            backgroundColor: DarkBlueTheme.colors.background,
          },
          title: 'Request a Feature',
        }}
      />
    </Stack>
  );
}
