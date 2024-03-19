import { ChevronRight } from '@tamagui/lucide-icons'
import { ListItem, Separator, YGroup } from 'tamagui'
import { useSshServerConnection } from '../../contexts/ServerConnection'
import { useEffect, useState } from 'react'
import { parseDockerContainerPs } from './util'

export default function DockerList() {
  const {sshClient} = useSshServerConnection()
  const [containers, setContainers] = useState<DockerContainer[]>([]);

  useEffect(() => {
    const fetchContainers = () => {
      console.log('Fetching containers', sshClient)
      sshClient?.execute('docker ps -a --no-trunc --format "{{json . }}"').then((response) => {
        const lines = response?.split('\n');
        const parsedContainers: DockerContainer[] = lines?.map(line => {
          try {
            return parseDockerContainerPs(JSON.parse(line));
          } catch (error) {
            console.error('Error parsing line:', line, error);
            return null;
          }
        }).filter(Boolean) as DockerContainer[];
        console.log(parsedContainers)
        setContainers(parsedContainers);
      }).catch((error) => console.log(error));
    }
    // Call fetchContainers immediately
    fetchContainers();
  
    // Then call it every 5 seconds
    const intervalId = setInterval(fetchContainers, 5000);
  
    // Clear the interval when the component is unmounted or sshClient changes
    return () => clearInterval(intervalId);
  }, [sshClient]);

  return (
    <YGroup alignSelf="center" bordered width={240} size="$5" separator={<Separator />}>
      <YGroup.Item>
        <ListItem
          hoverTheme
          pressTheme
          title="Star"
          subTitle="Subtitle"
          iconAfter={ChevronRight}
        />
      </YGroup.Item>
    </YGroup>
  )
}
