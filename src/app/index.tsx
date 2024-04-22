import React, { useState, useEffect } from 'react';
import { Plus } from '@tamagui/lucide-icons';
import { Button, Spacer, View } from 'tamagui';
import ServerModal from './modal';
import { getItem, setItem } from '../storage/secure';
import ServerCard from '../components/server-card';
import { router } from 'expo-router';
import { useSsh } from '../contexts/ssh';
import { Server } from '../typing/server';

export default function ServerSelectScreen() {
  const { sshServer, setSshServer } = useSsh();

  const [servers, setServers] = useState<Server[]>([]);
  const [serverModalOpen, setServerModalOpen] = useState(false);

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
    const newServers = servers.map((s) => (s === sshServer ? server : s));
    setItem('servers', newServers);
    setServers(newServers);
  };

  const handleServerPress = (server: Server) => {
    setSshServer(server);
    router.push('/(tabs)/docker');
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
    <View flex={1} alignItems="center" style={{ padding: 20 }}>
      <Spacer size="10%" />
      {servers.map((server, index) => (
        <ServerCard
          key={index}
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
        server={sshServer}
        onOpenChange={setServerModalOpen}
        onSaveServer={(server) =>
          sshServer ? updateServer(server) : addServer(server)
        }
      />
    </View>
  );
}
