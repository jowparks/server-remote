import { ScrollView, Spacer, View } from 'tamagui';
import React from 'react';

import { Separator, YGroup } from 'tamagui';
import { useSsh } from '../../../contexts/ssh';
import { useEffect, useState } from 'react';
import { processDockerPs } from '../../../util/docker';
import { DockerPs, DockerPsCommand } from '../../../typing/docker';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useDocker } from '../../../contexts/docker';
import ContainerCard from '../../../components/containers/container-card';
import Spin from '../../../components/general/spinner';
import { RefreshControl } from 'react-native';
import { useFocusedEffect } from '../../../util/focused-effect';

export default function DockerScreen() {
  return (
    <View flex={1} alignItems="center">
      <DockerList />
    </View>
  );
}

function DockerList() {
  const { sshClient } = useSsh();
  const { containers, setContainers, setCurrentContainerId } = useDocker();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(false);
  const navigation = useNavigation();
  const focused = navigation.isFocused();

  const [loaded, setLoaded] = useState(false);

  const router = useRouter();

  useFocusedEffect(() => {
    const fetchContainers = async () => {
      if (!sshClient) return;
      if (!focused) return;
      const response = await sshClient.exec(DockerPsCommand);
      const lines = response?.split('\n').filter(Boolean);
      const parsedContainers: DockerPs[] = lines
        ?.map((line) => {
          try {
            return processDockerPs(line);
          } catch (error) {
            console.error(error);
            return null;
          }
        })
        .filter(Boolean) as DockerPs[];
      setContainers(parsedContainers);
      setLoaded(true);
      setRefreshing(false);
    };
    // Call fetchContainers immediately
    fetchContainers();

    // Then call it every 5 seconds
    const intervalId = setInterval(fetchContainers, 5000);

    // Clear the interval when the component is unmounted or sshClient changes
    return () => clearInterval(intervalId);
  }, [sshClient, triggerRefresh]);

  const stopContainer = (container: DockerPs) => {
    sshClient
      ?.exec(`docker stop ${container.ID}`)
      .then((response) => {
        console.log(response);
      })
      .catch((error) => console.log(error));
  };

  // TODO handle these catches
  const forceStopContainer = (container: DockerPs) => {
    sshClient
      ?.exec(`docker kill ${container.ID}`)
      .then((response) => {
        console.log(response);
      })
      .catch((error) => console.log(error));
  };

  const startContainer = (container: DockerPs) => {
    sshClient
      ?.exec(`docker start ${container.ID}`)
      .then((response) => {
        console.log(response);
      })
      .catch((error) => console.log(error));
  };

  const restartContainer = (container: DockerPs) => {
    sshClient
      ?.exec(`docker restart ${container.ID}`)
      .then((response) => {
        console.log(response);
      })
      .catch((error) => console.log(error));
  };

  const pauseContainer = (container: DockerPs) => {
    sshClient
      ?.exec(`docker pause ${container.ID}`)
      .then((response) => {
        console.log(response);
      })
      .catch((error) => console.log(error));
  };

  const unpauseContainer = (container: DockerPs) => {
    sshClient
      ?.exec(`docker unpause ${container.ID}`)
      .then((response) => {
        console.log(response);
      })
      .catch((error) => console.log(error));
  };

  return !loaded ? (
    <Spin />
  ) : (
    <View flex={1} width={'90%'}>
      <Spacer size="4%" />
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setTriggerRefresh(!triggerRefresh);
              setRefreshing(true);
            }}
          />
        }
      >
        <YGroup
          alignSelf="center"
          bordered
          size="$5"
          width="100%"
          separator={<Separator />}
        >
          <YGroup.Item>
            {containers.map((container, index) => (
              <ContainerCard
                key={container.ID}
                name={container.Image?.split('/').pop() || 'N/A'}
                subheading={container.Status || 'N/A'}
                running={container.State === 'running'}
                paused={container.State === 'paused'}
                stopped={container.State === 'exited'}
                iconUrl={container.IconUrl} // Add this line
                onCardPress={() => {
                  setCurrentContainerId(container.ID || null);
                  router.navigate('(tabs)/docker/menu');
                }}
                onStart={() =>
                  container.State == 'paused'
                    ? unpauseContainer(container)
                    : startContainer(container)
                }
                onPause={() => pauseContainer(container)}
                onRestart={() => restartContainer(container)}
                onStop={() => stopContainer(container)}
                onForceStop={() => forceStopContainer(container)}
                listItemStyle={{
                  borderTopLeftRadius: index === 0 ? 10 : 0,
                  borderTopRightRadius: index === 0 ? 10 : 0,
                  borderBottomLeftRadius:
                    index === containers.length - 1 ? 10 : 0,
                  borderBottomRightRadius:
                    index === containers.length - 1 ? 10 : 0,
                }}
              />
            ))}
          </YGroup.Item>
        </YGroup>
      </ScrollView>
    </View>
  );
}
