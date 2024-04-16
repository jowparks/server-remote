import React from 'react';
import { ScrollView, View } from 'tamagui';
import { useDocker } from '../../../contexts/docker';
import JsonViewer from '../../../components/json';

export default function JsonScreen() {
  const { currentContainerId, containers } = useDocker();
  let container = containers.find((c) => c.ID === currentContainerId);

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
