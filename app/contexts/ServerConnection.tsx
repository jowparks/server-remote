import SSHClient from '@jowparks/react-native-ssh-sftp';
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Server } from '../types';


// Create the context
interface ServerContextValue {
    server: Server | null;
    setServer: React.Dispatch<React.SetStateAction<Server | null>>;
    sshClient: SSHClient | null;
}
const ServerConnectionContext = createContext<ServerContextValue>({
    server: null,
    setServer: () => {}, 
    sshClient: null
});

// Create the provider component
export function ServerConnectionProvider({ children }: { children: ReactNode }) {
  const [server, setServer] = useState<Server | null>(null);
  const [sshClient, setSSHClient] = useState<SSHClient | null>(null);


  useEffect(() => {
    let client: SSHClient | null = null;
    const connectToServer = async () => {
        if (server && server.password) {
            const client = await SSHClient.connectWithPassword(
                server.host,
                server.port,
                server.user,
                server.password,
                (err, _) => {
                    if (err) {
                        console.log('Fail: '+err.message);
                    } else {
                        console.log('Success');
                    }
                }
            )
        }
        if (server && server.key) {
            const client = await SSHClient.connectWithKey(
            server.host, 
            server.port, 
            server.user, 
            server.key, 
            server.keyPassphrase,
            (err, _) => {
                if (err) {
                console.log('Fail: '+err.message);
                } else {
                console.log('Success');
                }
            }
            )
        }
        setSSHClient(client);
    }

    connectToServer();
  }, [server]);

  return (
    <ServerConnectionContext.Provider value={{ server, setServer, sshClient }}>
      {children}
    </ServerConnectionContext.Provider>
  );
}

// Create a custom hook to use the server connection context
export function useServerConnection() {
  const context = useContext(ServerConnectionContext);
  if (context === undefined) {
    throw new Error('useServerConnection must be used within a ServerConnectionProvider');
  }
  return context;
}