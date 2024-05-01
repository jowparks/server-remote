import { View } from 'tamagui';
import React from 'react';

import { Separator, Spinner, YGroup } from 'tamagui';
import { useSsh } from '../../../contexts/ssh';
import { useEffect, useState } from 'react';
import { parseDockerContainerPs } from '../../../util/docker/util';
import { DockerContainer } from '../../../typing/docker';
import { useRouter } from 'expo-router';
import { useDocker } from '../../../contexts/docker';
import ContainerCard from '../../../components/container-card';

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
  const [loaded, setLoaded] = useState(false);

  const router = useRouter();

  // TODO use better spinner
  useEffect(() => {
    const fetchContainers = async () => {
      if (!sshClient) return;
      const response = await sshClient.execute(
        'docker ps -a --no-trunc --format "{{json . }}"',
      );
      const lines = response?.split('\n');
      const parsedContainers: DockerContainer[] = lines
        ?.map((line) => {
          try {
            // TODO there is an error here on the first line
            return parseDockerContainerPs(JSON.parse(line));
          } catch (error) {
            return null;
          }
        })
        .filter(Boolean) as DockerContainer[];
      setContainers(parsedContainers);
      setLoaded(true);
    };
    // Call fetchContainers immediately
    fetchContainers();

    // Then call it every 5 seconds
    const intervalId = setInterval(fetchContainers, 5000);

    // Clear the interval when the component is unmounted or sshClient changes
    return () => clearInterval(intervalId);
  }, [sshClient]);

  const stopContainer = (container: DockerContainer) => {
    sshClient
      ?.execute(`docker stop ${container.ID}`)
      .then((response) => {
        console.log(response);
      })
      .catch((error) => console.log(error));
  };

  const startContainer = (container: DockerContainer) => {
    sshClient
      ?.execute(`docker start ${container.ID}`)
      .then((response) => {
        console.log(response);
      })
      .catch((error) => console.log(error));
  };

  const restartContainer = (container: DockerContainer) => {
    sshClient
      ?.execute(`docker restart ${container.ID}`)
      .then((response) => {
        console.log(response);
      })
      .catch((error) => console.log(error));
  };

  const pauseContainer = (container: DockerContainer) => {
    sshClient
      ?.execute(`docker pause ${container.ID}`)
      .then((response) => {
        console.log(response);
      })
      .catch((error) => console.log(error));
  };

  const unpauseContainer = (container: DockerContainer) => {
    sshClient
      ?.execute(`docker unpause ${container.ID}`)
      .then((response) => {
        console.log(response);
      })
      .catch((error) => console.log(error));
  };

  return !loaded ? (
    <Spinner size="large" />
  ) : (
    <YGroup
      alignSelf="center"
      bordered
      width={'90%'}
      size="$5"
      separator={<Separator />}
    >
      <YGroup.Item>
        {containers.map((container) => (
          // TODO max width needed for text or it will push buttons off the screen
          <ContainerCard
            key={container.ID}
            name={container.Image?.split('/').pop() || 'N/A'}
            subheading={container.Status || 'N/A'}
            running={container.State === 'running'}
            paused={container.State === 'paused'}
            stopped={container.State === 'exited'}
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
          />
        ))}
      </YGroup.Item>
    </YGroup>
  );
}
