import React, { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { ChevronRight, Plus } from '@tamagui/lucide-icons'
import { Button, Card, H2, H3, H4, ListItem, Separator, Spacer, View, YGroup } from 'tamagui';


import SSHClient from '@jowparks/react-native-ssh-sftp';
import AddServerModal from './modal';

interface Server {
    host: string;
    port: number;
    user: string;
    password?: string;
    key?: string;
    keyPassphrase?: string;
}

interface StorageItems {
    servers: Server[];
}

async function setItem<K extends keyof StorageItems>(key: K, value: StorageItems[K]) {
        const item = JSON.stringify(value);
        await SecureStore.setItemAsync(key, item);
}

async function getItem<K extends keyof StorageItems>(key: K): Promise<StorageItems[K] | null> {
        const item = await SecureStore.getItemAsync(key);
    
        if (item) {
            return JSON.parse(item) as StorageItems[K];
        }
    
        return null;
}

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
                    // <YGroup.Item key={server.host+index}>
                    //     <ListItem
                    //         hoverTheme
                    //         pressTheme
                    //         title={server.host}
                    //         iconAfter={ChevronRight}
                    //     />
                    // </YGroup.Item>
                  <Card elevate size="$4" bordered key={server.host+index} style={{ marginBottom: 20, width: '90%' }}>
                    <Card.Header padded style={{ padding: 10 }}>
                        <H4>{server.host}</H4>
                    </Card.Header>
                  </Card>
                ))}
            <Button hoverTheme pressTheme onPress={() => setAddServerOpen(true)} style={{ marginTop: 20, width: '90%' }} >
                <Plus />
            </Button>
            <AddServerModal open={addServerOpen} onOpenChange={setAddServerOpen} onAddServer={() => {}} />
        </View>
    );
}