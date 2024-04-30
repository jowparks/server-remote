import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import { Server, hostname } from '../typing/server';
import SSHClient, { CallbackFunction } from '@jowparks/react-native-ssh-sftp';
import { storage } from '../storage/mmkv';

// Create the context
export type ExecuteCommandType = (
  command: string,
  callback?: CallbackFunction<string>,
) => Promise<string>;
interface SshContextValue {
  sshServer: Server | null;
  setSshServer: React.Dispatch<React.SetStateAction<Server | null>>;
  sshClient: SSHClient | null;
  executeCommand: ExecuteCommandType;
  commandHistory: string[];
}
const SshContext = createContext<SshContextValue>({
  sshServer: null,
  setSshServer: () => {},
  sshClient: null,
  executeCommand: () => Promise.resolve(''),
  commandHistory: [],
});

// Create the provider component
export function SshProvider({ children }: { children: ReactNode }) {
  const [server, setSshServer] = useState<Server | null>(null);
  const [sshClient, setSSHClient] = useState<SSHClient | null>(null);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);

  useEffect(() => {
    const loadedCommandHistory = storage.get<string[]>('commandHistory');
    if (loadedCommandHistory) {
      setCommandHistory(loadedCommandHistory);
    }
  }, []);

  useEffect(() => {
    let client: SSHClient | null = null;
    if (!server || (!server.password && !server.key)) {
      return;
    }
    const connectToServer = async () => {
      if (server && server.password) {
        client = await SSHClient.connectWithPassword(
          server.host,
          server.port,
          server.user,
          server.password,
          (err, _) => {
            if (err) {
              console.log('Fail: ' + err.message);
            }
          },
        );
      }
      if (server && server.key) {
        client = await SSHClient.connectWithKey(
          server.host,
          server.port,
          server.user,
          server.key,
          server.publicKey,
          server.keyPassphrase,
          (err, _) => {
            if (err) {
              console.log('Fail: ' + err.message);
            } else {
              console.log('Success');
            }
          },
        );
      }
      if (!client) {
        throw new Error('Failed to connect to server');
      }
      // Used for reconnecting on any error
      // const sshClientProxy = new Proxy(client, {
      //   get: function (target, prop, receiver) {
      //     if (typeof target[prop] === 'function') {
      //       return async function (...args) {
      //         try {
      //           return await target[prop].apply(target, args);
      //         } catch (error) {
      //           console.error('Error executing command, reconnecting...');
      //           // Reconnect using the appropriate method
      //           await connectToServer();
      //           // Retry the command
      //           return await target[prop].apply(target, args);
      //         }
      //       };
      //     } else {
      //       return target[prop];
      //     }
      //   },
      // });
      setSSHClient(client);
    };

    connectToServer();
  }, [server]);

  const executeCommand = async (
    command: string,
    callback?: CallbackFunction<string>,
  ) => {
    if (!sshClient || !server) {
      throw new Error('SSH client or server not set');
    }
    const newCommandHistory = [command, ...commandHistory];
    setCommandHistory(newCommandHistory);
    storage.setObject(`${hostname(server)}_command_history`, newCommandHistory);
    return await sshClient.execute(command, callback);
  };

  return (
    <SshContext.Provider
      value={{
        sshServer: server,
        setSshServer,
        sshClient,
        executeCommand,
        commandHistory,
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
