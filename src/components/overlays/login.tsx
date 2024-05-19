import { useBiometrics } from '../../contexts/biometrics';
import React from 'react';
import { useAuthentication } from '../../contexts/authentication';
import Splash from './splash';

export default function Login() {
  const { biometricsEnabled } = useBiometrics();
  const { authenticated } = useAuthentication();
  if (biometricsEnabled && !authenticated) {
    return <Splash />;
  }
  return <></>;
}
