import React, { useState, useEffect } from 'react';
import { Plus } from '@tamagui/lucide-icons';
import { Button, Spacer, View } from 'tamagui';
import ServerModal from './modal';
import { Server } from './types';
import { getItem, setItem } from './storage/secure';
import ServerCard from './components/server-card';
import { router } from 'expo-router';
import { useSshServerConnection } from './contexts/ServerConnection';

export default function ServerSelectScreen() {
  const { setSshServer } = useSshServerConnection();

  const [servers, setServers] = useState<Server[]>([]);
  const [serverModalOpen, setServerModalOpen] = useState(false);
  const [currentServer, setCurrentServer] = useState<Server | undefined>(
    undefined,
  );

  useEffect(() => {
    // Load servers from AsyncStorage
    getItem('servers').then((data) => {
      if (data) {
        setServers(data);
      }
    });
  }, []);

  const addServer = (server: Server) => {
    const newServers = [...servers, server];
    setItem('servers', newServers);
    setServers(newServers);
  };

  const removeServer = (server: Server) => {
    const newServers = servers.filter((s) => s !== server);
    setItem('servers', newServers);
    setServers(newServers);
  };

  const updateServer = (server: Server) => {
    const newServers = servers.map((s) => (s === currentServer ? server : s));
    setItem('servers', newServers);
    setServers(newServers);
  };

  const handleServerPress = (server: Server) => {
    setSshServer(server);
    router.replace('/(tabs)');
  };

  const handleServerEdit = (server: Server) => {
    setCurrentServer(server);
    setServerModalOpen(true);
  };

  const handleAddPress = () => {
    setServerModalOpen(true);
    setCurrentServer(undefined);
  };

  return (
    <View flex={1} alignItems="center" style={{ padding: 20 }}>
      <Spacer size="10%" />
      {servers.map((server, index) => (
        <ServerCard
          server={server}
          onEdit={(server) => handleServerEdit(server)}
          onDelete={(server) => removeServer(server)}
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
      <ServerModal
        open={serverModalOpen}
        server={currentServer}
        onOpenChange={setServerModalOpen}
        onSaveServer={(server) =>
          currentServer ? updateServer(server) : addServer(server)
        }
      />
    </View>
  );
}
