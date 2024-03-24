import { View } from 'tamagui';
import React from 'react';
import VirshList from '../components/vm/list';

export default function DockerScreen() {
  return (
    <View flex={1} alignItems="center">
      <VirshList />
    </View>
  );
}
