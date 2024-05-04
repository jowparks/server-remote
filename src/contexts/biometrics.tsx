import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import ReactNativeBiometrics, { BiometryType } from 'react-native-biometrics';
import { storage } from '../storage/mmkv';

interface BiometricsContextProps {
  biometrics: BiometryType | undefined;
  biometricsEnabled: boolean;
  setBiometricsEnabled: (value: boolean) => void;
  promptBiometrics: () => Promise<boolean>; // New method
}

const BiometricsContext = createContext<BiometricsContextProps | undefined>(
  undefined,
);

export function BiometricsProvider({ children }: { children: ReactNode }) {
  const [biometricsEnabled, setBiometricsEnabled] = useState<boolean>(true);
  const [biometrics, setBiometrics] = useState<BiometryType | undefined>(
    undefined,
  );
  const rnBiometrics = new ReactNativeBiometrics();
  const biometricStorageKey = 'biometricPublicKey';

  useEffect(() => {
    const storedPublicKey = storage.getString(biometricStorageKey);
    if (storedPublicKey) {
      setBiometricsEnabled(true);
    }
    const checkBiometrics = async () => {
      const { biometryType } = await rnBiometrics.isSensorAvailable();
      setBiometrics(biometryType);
    };
    checkBiometrics();
  }, []);

  useEffect(() => {
    setBiometricKey(biometricsEnabled);
  }, [biometricsEnabled]);

  const setBiometricKey = async (enable: boolean) => {
    if (enable) {
      const { publicKey } = await rnBiometrics.createKeys();
      storage.set(biometricStorageKey, publicKey);
    } else {
      storage.delete(biometricStorageKey);
    }
  };

  const promptBiometrics = async () => {
    // New method
    const { success } = await rnBiometrics.simplePrompt({
      promptMessage: 'Confirm biometrics to continue',
    });
    console.log('Biometrics success:', success);
    return success;
  };

  return (
    <BiometricsContext.Provider
      value={{
        biometrics,
        biometricsEnabled,
        setBiometricsEnabled,
        promptBiometrics,
      }}
    >
      {children}
    </BiometricsContext.Provider>
  );
}

export const useBiometrics = () => {
  const context = useContext(BiometricsContext);
  if (context === undefined) {
    throw new Error('useBiometrics must be used within a BiometricsProvider');
  }
  return context;
};
