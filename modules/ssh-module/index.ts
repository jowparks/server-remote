import {
  NativeModulesProxy,
  EventEmitter,
  Subscription,
} from 'expo-modules-core';

// Import the native module. On web, it will be resolved to SshModule.web.ts
// and on native platforms to SshModule.ts
import SshModule from './src/SshModule';
import { ChangeEventPayload } from './src/SshModule.types';

// Get the native constant value.
export const PI = SshModule.PI;

export function hello(): string {
  return SshModule.hello();
}

export async function setValueAsync(value: string) {
  return await SshModule.setValueAsync(value);
}

const emitter = new EventEmitter(SshModule ?? NativeModulesProxy.SshModule);

export function addChangeListener(
  listener: (event: ChangeEventPayload) => void,
): Subscription {
  return emitter.addListener<ChangeEventPayload>('onChange', listener);
}

export async function testRust(num1: number, num2: number): Promise<number> {
  return SshModule.testRust(num1, num2);
}

export async function connect(
  user: string,
  password: string,
  addrs: string,
): Promise<void> {
  await SshModule.connect(user, password, addrs)
    .then(() => console.log('Connected successfully'))
    .catch((err) => console.error('Error using SshModule.connect:', err));
}

export { ChangeEventPayload };
