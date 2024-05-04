import * as SecureStore from 'expo-secure-store';
import { Server } from '../typing/server';

interface StorageItems {
  servers: Server[];
}

export async function setItem<K extends keyof StorageItems>(
  key: K,
  value: StorageItems[K],
) {
  const item = JSON.stringify(value);
  await SecureStore.setItemAsync(key, item);
}

export async function getItem<K extends keyof StorageItems>(
  key: K,
): Promise<StorageItems[K] | null> {
  const item = await SecureStore.getItemAsync(key);

  if (item) {
    return JSON.parse(item) as StorageItems[K];
  }
  return null;
}
