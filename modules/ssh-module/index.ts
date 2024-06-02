import {
  NativeModulesProxy,
  EventEmitter,
  Subscription,
} from 'expo-modules-core';
import uuid from 'react-native-uuid';

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

const emitter = new EventEmitter(SshModule);

export function addChangeListener(
  listener: (event: ChangeEventPayload) => void,
): Subscription {
  return emitter.addListener<ChangeEventPayload>('onChange', listener);
}

export type ExecEventPayload = {
  [key: string]: string;
};

export function addExecListener(
  listener: (event: ExecEventPayload) => void,
): Subscription {
  return emitter.addListener<ExecEventPayload>('exec', listener);
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

export type ExecParams = {
  command: string;
  onData: (data: string) => void;
  onError?: (errorCode: string) => void;
  onComplete?: () => void;
};

export async function exec({
  command,
  onData,
  onError,
  onComplete,
}: ExecParams): Promise<string> {
  const commandId = uuid.v4();
  let completed = false;
  const listener = (event: { [key: string]: string }) => {
    if (event['commandId'] === commandId) {
      if (event['data'] === 'eventingComplete') {
        completed = true;
      } else {
        onData(event['data']);
      }
    }
  };

  const subscription = addExecListener(listener);

  const returnCode = await SshModule.exec(commandId, command);
  while (!completed) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  if (returnCode !== '0') {
    onError ? onError(returnCode) : null;
  } else {
    onComplete ? onComplete() : null;
  }
  subscription.remove();
  return returnCode;
}

export { ChangeEventPayload };
