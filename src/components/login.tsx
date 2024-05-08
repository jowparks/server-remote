import { useBiometrics } from '../contexts/biometrics';
import { StyleSheet, View } from 'react-native';
import { Text } from 'tamagui';
import React from 'react';
import { useAuthentication } from '../contexts/authentication';

const styles = StyleSheet.create({
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100000000000,
  },
});

export default function Splash() {
  const { biometricsEnabled } = useBiometrics();
  const { authenticated } = useAuthentication();
  // TODO make this the splash screen
  if (biometricsEnabled && !authenticated) {
    return (
      <View style={styles.fullScreen}>
        <Text>AUTHENTICATE YOU FOOL</Text>
      </View>
    );
  }
  return <></>;
}
