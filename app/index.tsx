import React, { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { ChevronRight } from '@tamagui/lucide-icons'
import { Button, ListItem, Separator, View, YGroup } from 'tamagui';


import SSHClient from '@jowparks/react-native-ssh-sftp';

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
        <View flex={1} alignItems="center">
            <YGroup alignSelf="center" bordered width={240} size="$5" separator={<Separator />}>
                {servers.map((server,index) => (
                    <YGroup.Item key={server.host+index}>
                        <ListItem
                            hoverTheme
                            pressTheme
                            title={server.host}
                            iconAfter={ChevronRight}
                        />
                    </YGroup.Item>
                ))}
            </YGroup>
            <Button onPress={() => addServer({ host: '192.168.1.51', port: 123, user: 'foo'})} >
                Add Server
            </Button>
        </View>
    );
}