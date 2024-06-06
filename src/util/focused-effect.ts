import { useNavigation } from 'expo-router';
import { useEffect } from 'react';

export function useFocusedEffect(
  callback: () => void | (() => void | undefined),
  deps: any[],
) {
  const navigation = useNavigation();
  const focused = navigation.isFocused();
  useEffect(() => {
    if (focused) {
      return callback();
    }
  }, [navigation.isFocused(), ...deps]);
}
