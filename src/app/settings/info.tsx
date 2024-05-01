import React from 'react';
import { View, Text } from 'tamagui';
import * as packageJson from '../../../package.json';

export default function Info() {
  return (
    <View>
      <Text>App Name: {packageJson.name}</Text>
      <Text>Version: {packageJson.version}</Text>
      <Text>Description: {packageJson.description}</Text>
    </View>
  );
}
