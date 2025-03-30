import { EventEmitter, Subscription } from 'expo-modules-core';

// Import the native module. On web, it will be resolved to SshModule.web.ts
// and on native platforms to SshModule.ts
import SshModule from './src/SshModule';
import { ChangeEventPayload } from './src/SshModule.types';

// Get the native constant value.
export const PI = SshModule.PI;

export type TransferProgressExpo = {
  // bigint strings
  transferred: string;
  total: string;
};

export type TransferProgress = {
  transferred: number;
  total: number;
};

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

export async function connect(
  user: string,
  password: string | null,
  key: string | null,
  addrs: string,
): Promise<void> {
  await SshModule.connect(user, password, key, addrs).then(() =>
    console.log('Connected successfully'),
  );
}

export type ExecParams = {
  command: string;
  commandId: string;
  onData: (data: string) => void;
  onComplete?: (returnCode: string) => void;
};

export async function exec({
  command,
  commandId,
  onData,
  onComplete,
}: ExecParams): Promise<string> {
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
  onComplete ? onComplete(returnCode) : null;
  subscription.remove();
  return returnCode;
}

export function cancel(id: string): void {
  SshModule.cancel(id);
}

export async function transfer(
  transferId: string,
  sourcePath: string,
  destinationPath: string,
  direction: string,
): Promise<string> {
  return SshModule.transfer(transferId, sourcePath, destinationPath, direction);
}

export async function transferProgress(
  transferId: string,
): Promise<TransferProgress> {
  const progress = (await SshModule.transferProgress(
    transferId,
  )) as TransferProgress;
  console.log('JS: transferProgress', progress);
  return {
    transferred: Number(progress.transferred),
    total: Number(progress.total),
  };
}

export { ChangeEventPayload };
