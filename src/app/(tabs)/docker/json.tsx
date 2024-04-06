import React from 'react';
import { ScrollView, View } from 'tamagui';
import { useDockerContainers } from '../../../contexts/DockerContainer';
import JsonTree from '../../../components/json-tree';

export default function JsonScreen() {
  const { currentContainerId, dockerContainers } = useDockerContainers();
  let container = dockerContainers.find((c) => c.ID === currentContainerId);

  // TODO fix error with created at
  container = container
    ? {
        ...container,
        CreatedAt: undefined,
      }
    : {};

  return (
    <View flex={1} alignItems="center">
      <ScrollView>
        <JsonTree data={container as Record<string, unknown>} />
      </ScrollView>
    </View>
  );
}
