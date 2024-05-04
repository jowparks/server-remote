import React from 'react';
import { View, Text } from 'tamagui';
import * as packageJson from '../../../package.json';

export default function Info() {
  // TODO: why do we need 90% on text items rather than container, won't work on container
  return (
    <View alignContent="center" alignItems="center">
      <Text width={'90%'}>App Name: {packageJson.name}</Text>
      <Text width={'90%'}>Version: {packageJson.version}</Text>
      <Text width={'90%'}>Description: {packageJson.description}</Text>
    </View>
  );
}
