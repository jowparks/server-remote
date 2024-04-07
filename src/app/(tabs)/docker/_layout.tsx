import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { DockerContainerProvider } from '../../../contexts/docker-container';
import { useSshServerConnection } from '../../../contexts/ssh-client';
import { PtyType } from '@jowparks/react-native-ssh-sftp';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function DockerLayout() {
  return <DockerLayoutNav />;
}

function DockerLayoutNav() {
  const { sshClient } = useSshServerConnection();

  // TODO use better spinner
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
    <DockerContainerProvider>
      <Stack>
        <Stack.Screen
          name="list"
          options={{ headerShown: true, title: 'Docker' }}
        />
        <Stack.Screen
          name="menu"
          options={{ headerShown: true, title: 'Menu' }}
        />
        <Stack.Screen
          name="details"
          options={{ headerShown: true, title: 'Details' }}
        />
        <Stack.Screen
          name="logs"
          options={{ headerShown: true, title: 'Logs' }}
        />
      </Stack>
    </DockerContainerProvider>
  );
}
