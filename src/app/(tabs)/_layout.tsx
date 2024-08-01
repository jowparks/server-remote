import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { DarkBlueTheme } from '../../style/theme';
import { useSsh } from '../../contexts/ssh';
import { Config } from '../../components/generic/types';
import { useGenericScreen } from '../../contexts/generic';
import SearchLayout from '../[generic]/_layout';

export default function TabLayout() {
  const { config, setConfig, setCurrentTab } = useGenericScreen();
  const { sshClient } = useSsh();
  useEffect(() => {
    if (!sshClient) return;
    sshClient
      .exec('cat /etc/serverRemote.json')
      .then((res) => {
        if (!res) {
          return;
        }
        const config = JSON.parse(res) as Config;
        setConfig(config);
      })
      .catch((error) => {
        console.error('Failed to fetch JSON:', error);
      });
  }, []);
  // TODO: use this patch to get dynamic tabs working: https://github.com/kennethstarkrl/expo-router-3.4.9-ds-patch
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'grey',
        tabBarActiveBackgroundColor: DarkBlueTheme.colors.background,
        tabBarInactiveBackgroundColor: DarkBlueTheme.colors.background,
        tabBarBackground: () => <></>,
      }}
      screenListeners={{
        tabPress: (e) => {
          const target = e.target?.split('-')[0];
          console.log('Tab target: ', target);
          if (!target) return;
          setCurrentTab(target);
        },
      }}
      initialRouteName="docker"
    >
      <Tabs.Screen
        name="docker"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'logo-docker' : 'logo-docker'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="vm"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'desktop-outline' : 'desktop-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="files"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'folder-outline' : 'folder-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'search' : 'search-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      {Object.keys(config?.tabs || {}).map((key) => {
        const tab = config?.tabs[key];
        if (!tab) return;
        return (
          <Tabs.Screen
            key={'[generic]'}
            name={'[generic]'}
            options={{
              headerShown: false,
              tabBarIcon: ({ focused, color, size }) => (
                <Ionicons
                  name={focused ? 'search' : 'search-outline'}
                  size={size}
                  color={color}
                />
              ),
            }}
          />
        );
      })}
    </Tabs>
  );
}

<Tabs.Screen
  name="search"
  options={{
    headerShown: false,
    tabBarIcon: ({ focused, color, size }) => (
      <Ionicons
        name={focused ? 'search' : 'search-outline'}
        size={size}
        color={color}
      />
    ),
  }}
/>;
function setError(arg0: string) {
  throw new Error('Function not implemented.');
}
