import { Stack } from 'expo-router';
import React from 'react';
import { DarkBlueTheme } from '../../../style/theme';
import { DrawerToggleButton } from '@react-navigation/drawer';
import DrawerButton from '../../../components/header/drawer-button';
import HeaderBack from '../../../components/header/header-back';
import DetailsNav from '../../../components/nav/details-nav';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function DockerLayout() {
  return <DockerLayoutNav />;
}

function DockerLayoutNav() {
  // useEffect(() => {
  //   if (!sshClient) return;
  //   const fetchContainers = async () => {
  //     await sshClient.startShell(PtyType.VANILLA);
  //     sshClient.on('Shell', (event) => {
  //       console.warn('Shell: ', event);
  //     });
  //     const str = 'ls -l /\n';
  //     sshClient.writeToShell(str).then((str) => {
  //       console.log('write resp: ', str);
  //     });
  //   };
  //   // Call fetchContainers immediately
  //   fetchContainers();

  //   // Clear the interval when the component is unmounted or sshClient changes
  //   return () => sshClient?.closeShell();
  // }, []);
  return (
    <Stack>
      <Stack.Screen
        name="list"
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: DarkBlueTheme.colors.background,
          },
          title: 'Docker',
          headerLeft: () => <DrawerButton />,
        }}
      />
      <Stack.Screen
        name="menu"
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: DarkBlueTheme.colors.background,
          },
          title: 'Menu',
          headerLeft: () => <HeaderBack />,
        }}
      />
      <Stack.Screen
        name="details"
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: DarkBlueTheme.colors.background,
          },
          title: 'Details',
          headerLeft: () => <HeaderBack />,
          headerRight: DetailsNav,
        }}
      />
      <Stack.Screen
        name="logs"
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: DarkBlueTheme.colors.background,
          },
          title: 'Logs',
          headerLeft: () => <HeaderBack />,
        }}
      />
    </Stack>
  );
}
