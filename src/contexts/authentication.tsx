import React, { createContext, useContext, useEffect, useState } from 'react';
import { useBiometrics } from '../contexts/biometrics';
import { useRouter } from 'expo-router';

// Create a new context
const AuthenticationContext = createContext({ authenticated: false });

export const useAuthentication = () => useContext(AuthenticationContext);

export const AuthenticationProvider = ({ children }) => {
  const { biometricsEnabled, promptBiometrics } = useBiometrics();
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (biometricsEnabled && !authenticated) {
      router.push('/');
    } else {
      router.canGoBack() ? router.back() : router.push('/servers');
    }
  }, [authenticated]);

  useEffect(() => {
    const authenticate = async () => {
      if (biometricsEnabled === null) {
        return;
      }
      if (biometricsEnabled && !authenticated) {
        const success = await promptBiometrics();
        if (success) {
          setAuthenticated(true);
          return;
        } else {
          setTimeout(authenticate, 100);
          return;
        }
      }
    };
    authenticate();
  }, [biometricsEnabled, authenticated]);

  return (
    <AuthenticationContext.Provider value={{ authenticated }}>
      {children}
    </AuthenticationContext.Provider>
  );
};
