import { View } from 'tamagui';
import DockerList from '../components/docker/list';
import React from 'react';

export default function DockerScreen() {
  return (
    <View flex={1} alignItems="center">
      <DockerList />
    </View>
  );
}
