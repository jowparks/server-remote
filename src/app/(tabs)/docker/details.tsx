import React, { useEffect } from 'react';
import { ScrollView, View, Text, Spinner } from 'tamagui';
import { useDocker } from '../../../contexts/docker';
import JsonViewer from '../../../components/containers/json';
import { useSsh } from '../../../contexts/ssh';
import { DockerContainer, DockerInspectCommand } from '../../../typing/docker';

export default function JsonScreen() {
  const { currentContainerId } = useDocker();
  const { sshClient } = useSsh();
  const [container, setContainer] = React.useState<DockerContainer | null>(
    null,
  );
  useEffect(() => {
    const inspect = async () => {
      if (!sshClient || !currentContainerId) return;
      const response = await sshClient.execute(
        DockerInspectCommand(currentContainerId),
      );
      try {
        const parsedContainer: DockerContainer = JSON.parse(response)[0];
        setContainer(parsedContainer);
      } catch (error) {
        console.error(error);
        return null;
      }
    };
    // Call fetchContainers immediately
    inspect();

    // Then call it every 5 seconds
    const intervalId = setInterval(inspect, 5000);

    // Clear the interval when the component is unmounted or sshClient changes
    return () => clearInterval(intervalId);
  }, [currentContainerId, sshClient]);

  if (!container) return <Spinner />;
  return (
    <View flex={1} width={'100%'} alignItems="center">
      <ScrollView>
        <JsonViewer
          data={container as Record<string, unknown>}
          renderArrayLabel={(label) => (
            <Text style={{ color: 'lightblue' }} selectable>
              {label}
            </Text>
          )}
        />
      </ScrollView>
    </View>
  );
}
