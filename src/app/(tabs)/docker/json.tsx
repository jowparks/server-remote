import React, { useLayoutEffect } from 'react';
import JSONTree from 'react-native-json-tree';
import { ScrollView, View } from 'tamagui';
import { useDockerContainers } from '../../../contexts/DockerContainer';
import JsonTree from '../../../components/generic/json-tree';
import { useRouter } from 'expo-router';

export default function JsonScreen({ navigation }) {
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
