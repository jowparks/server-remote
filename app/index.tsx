import React, { useState, useEffect } from 'react';
import { Plus } from '@tamagui/lucide-icons'
import { Button, Spacer, View } from 'tamagui';
import AddServerModal from './modal';
import { Server } from './types';
import { getItem, setItem } from './storage/secure';
import ServerCard from './components/server-card';



export default function ServerSelectScreen() {
    const [servers, setServers] = useState<Server[]>([]);
    const [addServerOpen, setAddServerOpen] = useState(false);

    useEffect(() => {
        // Load servers from AsyncStorage
        getItem('servers').then(data => {
            if (data) {
                setServers(data);
            }
        });
    }, []);

    const addServer = (server: Server) => {
        // Add server to AsyncStorage
        const newServers = [...servers, server];
        setItem('servers', newServers);
        setServers(newServers);
    };

    return (
        <View flex={1} alignItems="center" style={{ padding: 20 }}>
            <Spacer size="10%" />
                {servers.map((server, index) => (
                    <ServerCard server={server}/>
                ))}
            <Button hoverTheme pressTheme onPress={() => setAddServerOpen(true)} style={{ marginTop: 20, width: '90%' }} >
                <Plus />
            </Button>
            <AddServerModal open={addServerOpen} onOpenChange={setAddServerOpen} onAddServer={(server) => addServer(server)} />
        </View>
    );
}