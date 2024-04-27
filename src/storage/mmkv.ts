import { MMKV } from 'react-native-mmkv';

class ExtendedMMKV extends MMKV {
  get<T>(key: string): T | null {
    const result = this.getString(key);
    return result ? (JSON.parse(result) as T) : null;
  }
  setObject(key: string, value: Object) {
    this.set(key, JSON.stringify(value));
  }
}

export const storage = new ExtendedMMKV();
