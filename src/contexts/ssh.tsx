import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import { Server } from '../typing/server';
import { ExecParams, connect, exec } from '../../modules/ssh-module';

export type SSHClient = {
  // waits until command is done, returns all of response
  exec: (command: string) => Promise<string>;
  // uses onData, onError, onComplete to handle response as it comes in
  execAsync: (params: ExecParams) => Promise<string>;
  sftpDownload: (
    remotePath: string,
    localPath: string,
    onError: (error) => void,
  ) => Promise<void>;
};

// Create the context
interface SshContextValue {
  sshServer: Server | null;
  setSshServer: React.Dispatch<React.SetStateAction<Server | null>>;
  sshClient: SSHClient | null;
}
const SshContext = createContext<SshContextValue>({
  sshServer: null,
  setSshServer: () => {},
  sshClient: null,
});

// Create the provider component
export function SshProvider({ children }: { children: ReactNode }) {
  const [sshClient, setSshClient] = useState<SSHClient | null>(null);
  const [server, setSshServer] = useState<Server | null>(null);

  useEffect(() => {
    if (!server || (!server.password && !server.key)) {
      return;
    }
    const connectToServer = async () => {
      setSshClient(null);
      if (server && !!server.password) {
        (async () => {
          await connect(
            server.user,
            server.password ?? '',
            `${server.host}:${server.port}`,
          );
          const sshClient: SSHClient = {
            exec: execInner,
            execAsync: execInnerAsync,
            sftpDownload: async (remotePath, localPath, onError) => {},
          };
          setSshClient(sshClient);
        })();
      }
      if (server && server.key) {
        //
      }
    };

    connectToServer();
  }, [server]);

  const execInner = async (command: string) => {
    if (!server) {
      throw new Error('Not connected to a server');
    }
    let response = '';
    return new Promise<string>(async (resolve, reject) => {
      await exec({
        command,
        onData: (data) => {
          response += data;
        },
        onError: (error) => {
          reject(error);
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
