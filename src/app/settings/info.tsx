import React from 'react';
import { View, Text } from 'tamagui';
import * as packageJson from '../../../package.json';

export default function Info() {
  return (
    <View width="90%" alignContent="center" alignItems="center" padding="$4">
      <Text width={'100%'}>App Name: {packageJson.name}</Text>
      <Text width={'100%'}>Version: {packageJson.version}</Text>
      <Text width={'100%'}>Description: {packageJson.description}</Text>
    </View>
  );
}
