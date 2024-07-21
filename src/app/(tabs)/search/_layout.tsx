import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { DarkBlueTheme } from '../../../style/theme';
import DrawerButton from '../../../components/header/drawer-button';
import { useSsh } from '../../../contexts/ssh';
import Spin from '../../../components/general/spinner';
import { Text } from 'tamagui';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function SearchLayout() {
  return <SearchLayoutNav />;
}

function SearchLayoutNav() {
  const { sshClient } = useSsh();
  const [jsonData, setJsonData] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sshClient) {
      sshClient
        .exec('cat /etc/serverRemote.json')
        .then((res) => {
          if (!res) {
            setError('Could not load JSON from remote server');
          }
          setJsonData(res);
        })
        .catch((error) => {
          console.error('Failed to fetch JSON:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [sshClient]); // Dependency array ensures this effect runs only when sshClient changes

  if (isLoading) {
    return <Spin />; // Or any other loading indicator
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  return (
    <Stack>
      <Stack.Screen
        name="generic"
        initialParams={{
          jsonData: jsonData,
          currentPath: '',
        }}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: DarkBlueTheme.colors.background,
          },
          title: 'Request',
          headerLeft: () => <DrawerButton />,
        }}
      />
    </Stack>
  );
}
