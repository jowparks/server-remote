import React from 'react';
import { ScrollView, View } from 'tamagui';
import { useDockerContainers } from '../../../contexts/docker-container';
import JsonViewer from '../../../components/json';

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
        <JsonViewer data={container as Record<string, unknown>} />
      </ScrollView>
    </View>
  );
}
