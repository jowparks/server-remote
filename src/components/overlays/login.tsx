import { useBiometrics } from '../../contexts/biometrics';
import React from 'react';
import { useAuthentication } from '../../contexts/authentication';
import Splash from './splash';
import { Button, Text } from 'tamagui';

export default function Login() {
  const { biometricsEnabled } = useBiometrics();
  const { authenticated, triggerAuth } = useAuthentication();
  if (biometricsEnabled && !authenticated) {
    return (
      <Splash>
        <Button onPress={triggerAuth}>
          <Text>Login</Text>
        </Button>
      </Splash>
    );
  }
  return <></>;
}
