import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useBiometrics } from '../contexts/biometrics';
import { AppState } from 'react-native';

// Create a new context
const AuthenticationContext = createContext({ authenticated: false });

export const useAuthentication = () => useContext(AuthenticationContext);

export const AuthenticationProvider = ({ children }) => {
  const { biometricsEnabled, promptBiometrics } = useBiometrics();
  const [authenticated, setAuthenticated] = useState(false);
  const background = useRef(false);

  useEffect(() => {
    const handler = AppState.addEventListener('change', handleAppStateChange);
    return () => handler.remove();
  }, []);

  const handleAppStateChange = (nextAppState) => {
    if (nextAppState === 'background') {
      background.current = true;
      return;
    }
    if (background.current) {
      background.current = false;
      setAuthenticated(false);
    }
  };

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
