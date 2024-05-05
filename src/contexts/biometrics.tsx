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
  biometricsEnabled: boolean | null;
  setBiometricsEnabled: (value: boolean) => void;
  promptBiometrics: () => Promise<boolean>;
}

const BiometricsContext = createContext<BiometricsContextProps | undefined>(
  undefined,
);

export function BiometricsProvider({ children }: { children: ReactNode }) {
  const [biometricsEnabled, setBiometricsEnabled] = useState<boolean | null>(
    null,
  );
  const [biometrics, setBiometrics] = useState<BiometryType | undefined>(
    undefined,
  );
  const rnBiometrics = new ReactNativeBiometrics();
  const biometricStorageKey = 'biometricPublicKey';

  useEffect(() => {
    const checkBiometrics = async () => {
      const storedPublicKey = storage.getString(biometricStorageKey);
      console.log('Stored public key:', storedPublicKey);
      if (storedPublicKey) {
        setBiometricsEnabled(true);
      } else {
        setBiometricsEnabled(false);
      }
      const { biometryType } = await rnBiometrics.isSensorAvailable();
      setBiometrics(biometryType);
    };
    checkBiometrics();
  }, []);

  useEffect(() => {
    if (biometricsEnabled == null) return;
    setBiometricKey(biometricsEnabled);
  }, [biometricsEnabled]);

  const setBiometricKey = async (enable: boolean) => {
    if (enable) {
      const { publicKey } = await rnBiometrics.createKeys();
      storage.set(biometricStorageKey, publicKey);
    } else {
      storage.delete(biometricStorageKey);
    }
    console.log(storage.getString(biometricStorageKey));
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
