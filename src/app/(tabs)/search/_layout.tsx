import { Stack } from 'expo-router';
import React from 'react';
import { DarkBlueTheme } from '../../../style/theme';
import HeaderBack from '../../../components/header/header-back';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function SearchLayout() {
  return <SearchLayoutNav />;
}

function SearchLayoutNav() {
  return (
    <Stack>
      <Stack.Screen
        name="generic"
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: DarkBlueTheme.colors.background,
          },
          title: 'Request',
          headerLeft: () => <HeaderBack />,
        }}
      />
    </Stack>
  );
}
