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
  connect: (user: string, password: string, addrs: string) => void;
};

// Create the context
interface SshContextValue {
  sshServer: Server | null;
  setSshServer: React.Dispatch<React.SetStateAction<Server | null>>;
  sshClient: SSHClient | null;
  connect: (user: string, password: string, addrs: string) => void;
}
const SshContext = createContext<SshContextValue>({
  sshServer: null,
  setSshServer: () => {},
  sshClient: null,
  connect: () => {},
});

// Create the provider component
export function SshProvider({ children }: { children: ReactNode }) {
  const [sshClient, setSshClient] = useState<SSHClient | null>(null);
  const [server, setSshServer] = useState<Server | null>(null);

  const connectToServer = async (server: Server) => {
    if (server && !!server.password) {
      await connect(
        server.user,
        server.password ?? '',
        `${server.host}:${server.port}`,
      );
      const sshClient: SSHClient = {
        exec: execInner,
        execAsync: execInnerAsync,
        cancel,
        transfer,
        transferProgress,
        connect,
      };
      return sshClient;
    }
    if (server && server.key) {
      //
    }
    return null;
  };

  useEffect(() => {
    const connect = async () => {
      if (!server || (!server.password && !server.key)) {
        return;
      }
      const client = await connectToServer(server);
      setSshClient(client);
    };
    connect();
  }, [server]);

  // TODO make this cancellable too, cleanup this interface relative to SshModule
  const execInner = async (command: string) => {
    if (!server) {
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

  const execInnerAsync = async (params: ExecParams) => {
    if (!server) {
      throw new Error('Not connected to a server');
    }
    return exec(params);
  };

  return (
    <SshContext.Provider
      value={{
        sshServer: server,
        setSshServer,
        sshClient,
        connect,
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
