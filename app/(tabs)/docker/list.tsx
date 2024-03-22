import { ChevronRight } from '@tamagui/lucide-icons';
import { ListItem, Separator, YGroup } from 'tamagui';
import { useSshServerConnection } from '../../contexts/ServerConnection';
import { useEffect, useState } from 'react';
import { parseDockerContainerPs } from './util';
import DockerCard from './card';

export default function DockerList() {
  const { sshClient } = useSshServerConnection();
  const [containers, setContainers] = useState<DockerContainer[]>([]);
  const [trigger, setTrigger] = useState(false);

  useEffect(() => {
    const fetchContainers = () => {
      sshClient
        ?.execute('docker ps -a --no-trunc --format "{{json . }}"')
        .then((response) => {
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
        })
        .catch((error) => console.log(error));
    };
    // Call fetchContainers immediately
    fetchContainers();

    // Then call it every 5 seconds
    const intervalId = setInterval(fetchContainers, 5000);

    // Clear the interval when the component is unmounted or sshClient changes
    return () => clearInterval(intervalId);
  }, [sshClient, trigger]);

  const stopContainer = (container: DockerContainer) => {
    setTrigger((prev) => !prev);
    sshClient
      ?.execute(`docker stop ${container.ID}`)
      .then((response) => {
        console.log(response);
        setTrigger((prev) => !prev);
      })
      .catch((error) => console.log(error));
  };

  const startContainer = (container: DockerContainer) => {
    setTrigger((prev) => !prev);
    sshClient
      ?.execute(`docker start ${container.ID}`)
      .then((response) => {
        console.log(response);
        setTrigger((prev) => !prev);
      })
      .catch((error) => console.log(error));
  };

  const restartContainer = (container: DockerContainer) => {
    setTrigger((prev) => !prev);
    sshClient
      ?.execute(`docker restart ${container.ID}`)
      .then((response) => {
        console.log(response);
        setTrigger((prev) => !prev);
      })
      .catch((error) => console.log(error));
  };

  const pauseContainer = (container: DockerContainer) => {
    setTrigger((prev) => !prev);
    sshClient
      ?.execute(`docker pause ${container.ID}`)
      .then((response) => {
        console.log(response);
        setTrigger((prev) => !prev);
      })
      .catch((error) => console.log(error));
  };

  const unpauseContainer = (container: DockerContainer) => {
    setTrigger((prev) => !prev);
    sshClient
      ?.execute(`docker unpause ${container.ID}`)
      .then((response) => {
        console.log(response);
        setTrigger((prev) => !prev);
      })
      .catch((error) => console.log(error));
  };

  return (
    <YGroup
      alignSelf="center"
      bordered
      width={'90%'}
      size="$5"
      separator={<Separator />}
    >
      <YGroup.Item>
        {containers.map((container) => (
          <DockerCard
            key={container.ID}
            container={container}
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
