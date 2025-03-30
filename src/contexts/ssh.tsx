import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import { Server } from '../typing/server';
import {
  ExecParams,
  cancel,
  connect,
  transferProgress,
  exec,
  transfer,
  TransferProgress,
} from '../../modules/ssh-module';
import uuid from 'react-native-uuid';

export type SSHClient = {
  // waits until command is done, returns all of response
  exec: (command: string) => Promise<string>;
  // uses onData, onError, onComplete to handle response as it comes in
  execAsync: (params: ExecParams) => Promise<string>;
  // cancel a command based on its commandId
  cancel: (commandId: string) => void;
  // download a file from the server
  transfer: (
    transferId: string,
    sourcePath: string,
    destinationPath: string,
    direction: string,
  ) => Promise<string>;
  // get the progress of a download
  transferProgress: (transferId: string) => Promise<TransferProgress>;
};

// Create the context
interface SshContextValue {
  sshServer: Server | null;
  setSshServer: (server: Server | null) => void;
  connectToServer: (server: Server) => Promise<void>;
  sshClient: SSHClient | null;
}
const SshContext = createContext<SshContextValue>({
  sshServer: null,
  setSshServer: () => {},
  connectToServer: () => Promise.resolve(),
  sshClient: null,
});

// Create the provider component
export function SshProvider({ children }: { children: ReactNode }) {
  const [sshClient, setSshClient] = useState<SSHClient | null>(null);
  const [server, setSshServer] = useState<Server | null>(null);

  const connectToServer = async (server: Server) => {
    setSshClient(null);
    await connect(
      server.user,
      server.password ?? null,
      server.key ?? null,
      `${server.host}:${server.port}`,
    );

    // Create the SSH client with a closure over the server parameter
    // instead of relying on the state variable
    const sshClient: SSHClient = {
      exec: (command) => execInner(command, server),
      execAsync: (params) => execInnerAsync(params, server),
      cancel,
      transfer,
      transferProgress,
    };

    setSshClient(sshClient);
    setSshServer(server);
  };

  // TODO make this cancellable too, cleanup this interface relative to SshModule
  const execInner = async (command: string, serverParam: Server) => {
    if (!serverParam) {
      throw new Error('Not connected to a server');
    }
    let response = '';
    const commandId = uuid.v4() as string;
    return new Promise<string>(async (resolve) => {
      await exec({
        command,
        commandId,
        onData: (data) => {
          response += data;
        },
        onComplete: () => {
          resolve(response);
        },
      });
      resolve(response);
    });
  };

  // Update execInnerAsync to accept server as a parameter
  const execInnerAsync = async (params: ExecParams, serverParam: Server) => {
    if (!serverParam) {
      throw new Error('Not connected to a server');
    }
    return exec(params);
  };

  return (
    <SshContext.Provider
      value={{
        sshServer: server,
        setSshServer,
        connectToServer,
        sshClient,
      }}
    >
      {children}
    </SshContext.Provider>
  );
}

// Create a custom hook to use the server connection context
export function useSsh() {
  const context = useContext(SshContext);
  if (context === undefined) {
    throw new Error(
      'useServerConnection must be used within a ServerConnectionProvider',
    );
  }
  return context;
}
