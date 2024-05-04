import React from 'react';
import { View, Text, XStack, Switch } from 'tamagui';
import { useBiometrics } from '../../contexts/biometrics';

export default function App() {
  // TODO: why do we need 90% on text items rather than container, won't work on container
  const { biometricsEnabled, setBiometricsEnabled } = useBiometrics();
  return (
    <View
      width={'90%'}
      alignContent="center"
      alignItems="center"
      alignSelf="center"
    >
      <XStack justifyContent="space-between" alignItems="center" width={'100%'}>
        <Text>Lockscreen</Text>
        <Switch
          size={'$3'}
          defaultChecked={biometricsEnabled}
          onCheckedChange={setBiometricsEnabled}
        >
          <Switch.Thumb size={'$3'} animation="quicker" />
        </Switch>
      </XStack>
    </View>
  );
}
