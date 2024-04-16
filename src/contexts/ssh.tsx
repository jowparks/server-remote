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
            } else {
              console.log('Success');
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
