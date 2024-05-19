import { useBiometrics } from '../../contexts/biometrics';
import React from 'react';
import { useAuthentication } from '../../contexts/authentication';
import Splash from './splash';
import { Text } from 'tamagui';

export default function Login() {
  const { biometricsEnabled } = useBiometrics();
  const { authenticated } = useAuthentication();
  if (biometricsEnabled && !authenticated) {
    return (
      <Splash>
        <Text alignSelf="center" alignItems="center" alignContent="center">
          AUTHENTICATE FOOL
        </Text>
      </Splash>
    );
  }
  return <></>;
}
