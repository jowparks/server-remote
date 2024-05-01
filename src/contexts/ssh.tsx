import SSHClient from '@jowparks/react-native-ssh-sftp';
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import { Server } from '../typing/server';

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
  const [server, setSshServer] = useState<Server | null>(null);
  const [sshClient, setSSHClient] = useState<SSHClient | null>(null);

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

  return (
    <SshContext.Provider value={{ sshServer: server, setSshServer, sshClient }}>
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
