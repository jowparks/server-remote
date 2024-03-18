import React, { useState, useEffect } from 'react';
import { Plus } from '@tamagui/lucide-icons'
import { Button, Spacer, View } from 'tamagui';
import ServerModal from './modal';
import { Server } from './types';
import { getItem, setItem } from './storage/secure';
import ServerCard from './components/server-card';



export default function ServerSelectScreen() {
    const [servers, setServers] = useState<Server[]>([]);
    const [serverModalOpen, setServerModalOpen] = useState(false);
    const [currentServer, setCurrentServer] = useState<Server | undefined>(undefined);

    useEffect(() => {
        // Load servers from AsyncStorage
        getItem('servers').then(data => {
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
        const newServers = servers.filter(s => s !== server);
        setItem('servers', newServers);
        setServers(newServers);
    }

    const updateServer = (server: Server) => {
        const newServers = servers.map(s => s === currentServer ? server : s);
        setItem('servers', newServers);
        setServers(newServers);
    }

    return (
        <View flex={1} alignItems="center" style={{ padding: 20 }}>
            <Spacer size="10%" />
                {servers.map((server, index) => (
                    <ServerCard server={server} onEdit={() => {
                        setCurrentServer(server);
                        setServerModalOpen(true);
                    }} onDelete={(server) => removeServer(server)}/>
                ))}
            <Button hoverTheme pressTheme onPress={() => {
                setServerModalOpen(true)
                setCurrentServer(undefined)
            }} style={{ marginTop: 20, width: '90%' }} >
                <Plus />
            </Button>
            <ServerModal open={serverModalOpen} server={currentServer} onOpenChange={setServerModalOpen} onSaveServer={(server) => currentServer ? updateServer(server) : addServer(server)} />
        </View>
    );
}