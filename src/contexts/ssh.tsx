import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import { Server } from '../typing/server';
import { connect, exec } from '../../modules/ssh-module';

type SSHClient = any;
const SSHClient = {
  connectWithPassword: (a, b, c, d, e) => {},
  connectWithKey: (a, b, c, d, e, f, g) => {},
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
  const [server, setSshServer] = useState<Server | null>(null);
  const [sshClient, setSSHClient] = useState<SSHClient | null>(null);

  useEffect(() => {
    let client: SSHClient | null = null;
    if (!server || (!server.password && !server.key)) {
      return;
    }
    const connectToServer = async () => {
      if (server && !!server.password) {
        (async () => {
          console.log('c');
          await connect(
            server.user,
            server.password ?? '',
            `${server.host}:${server.port}`,
          );
          console.log('password connected');
          const output = await exec('ls /');
          console.log(output);
          console.log('password executed');
        })();
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
