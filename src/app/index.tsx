import React, { useState, useEffect } from 'react';
import { Plus } from '@tamagui/lucide-icons';
import { Button, ScrollView, Spacer, View } from 'tamagui';
import ServerModal from './add-server/modal';
import { StorageKeys, getItem, setItem } from '../storage/secure';
import ServerCard from '../components/containers/server-card';
import { router } from 'expo-router';
import { useSsh } from '../contexts/ssh';
import { Server, hostname } from '../typing/server';
import { useFiles } from '../contexts/files';
import Alert from '../components/general/alert';

export default function ServerSelectScreen() {
  const { sshServer, connectToServer, setSshServer } = useSsh();
  const { setHostName } = useFiles();
  const [servers, setServers] = useState<Server[]>([]);
  const [serverModalOpen, setServerModalOpen] = useState(false);
  const [deleteServer, setDeleteServer] = useState<Server | null>(null);
  useEffect(() => {
    // Load servers from AsyncStorage
    getItem(StorageKeys.servers).then((data) => {
      if (data) {
        setServers(data);
      }
    });
  }, []);

  const upsertServer = (server: Server) => {
    // First check if this server already exists by finding a matching server
    const existingServerIndex = servers.findIndex(
      (s) => s.name === server.name,
    );

    let newServers;
    if (existingServerIndex >= 0) {
      // Update existing server
      newServers = [...servers];
      newServers[existingServerIndex] = server;
    } else {
      // Add new server
      newServers = [...servers, server];
    }

    setItem(StorageKeys.servers, newServers);
    setServers(newServers);
  };

  const handleServerPress = (server: Server) => {
    setSshServer(server);
    setHostName(hostname(server));
    connectToServer(server).then(() => router.push('/(tabs)/docker'));
  };

  const handleServerEdit = (server: Server) => {
    setSshServer(server);
    setServerModalOpen(true);
  };

  const handleAddPress = () => {
    setSshServer(null);
    setServerModalOpen(true);
  };

  return (
    <ScrollView>
      <View flex={1} alignItems="center" style={{ padding: 20 }}>
        <Spacer size="8%" />
        {servers.map((server, index) => (
          <ServerCard
            key={index}
            server={server}
            onEdit={(server) => handleServerEdit(server)}
            onDelete={(server) => setDeleteServer(server)}
            onPress={(server) => handleServerPress(server)}
          />
        ))}
        <Button
          hoverTheme
          pressTheme
          onPress={() => handleAddPress()}
          style={{ marginTop: 20, width: '90%' }}
        >
          <Plus />
        </Button>
        {!!serverModalOpen && (
          <ServerModal
            open={serverModalOpen}
            server={sshServer}
            onOpenChange={setServerModalOpen}
            onSaveServer={upsertServer}
          />
        )}
        {!!deleteServer && (
          <Alert
            title="WARNING: This action cannot be undone!"
            description={`Are you sure you want to delete ${deleteServer.name}?`}
            open={!!deleteServer}
            onOk={() => {
              setServers(servers.filter((s) => s !== deleteServer));
              setDeleteServer(null);
            }}
            onCancel={() => setDeleteServer(null)}
          />
        )}
      </View>
    </ScrollView>
  );
}
