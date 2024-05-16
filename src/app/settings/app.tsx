import React from 'react';
import { View, Text, XStack, Switch, Spacer } from 'tamagui';
import { useBiometrics } from '../../contexts/biometrics';

export default function App() {
  const { biometricsEnabled, setBiometricsEnabled } = useBiometrics();
  return (
    <View
      width={'90%'}
      alignContent="center"
      alignItems="center"
      alignSelf="center"
    >
      <Spacer size={'$4'} />
      <XStack justifyContent="space-between" width={'100%'}>
        <Text>Lockscreen</Text>
        <View>
          <Switch
            size={'$3'}
            defaultChecked={!!biometricsEnabled}
            onCheckedChange={setBiometricsEnabled}
          >
            <Switch.Thumb size={'$3'} />
          </Switch>
        </View>
      </XStack>
    </View>
  );
}
