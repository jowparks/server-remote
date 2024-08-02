import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { DarkBlueTheme } from '../../style/theme';
import { useSsh } from '../../contexts/ssh';
import { Config } from '../../components/generic/types';
import { useGenericScreen } from '../../contexts/generic';
import Spin from '../../components/general/spinner';

export default function TabLayout() {
  const { config, setConfig, setCurrentTab } = useGenericScreen();
  const { sshClient } = useSsh();
  useEffect(() => {
    console.log('fetching config');
    if (!sshClient) return;
    console.log('fetching config inner');
    const fetchJson = async () => {
      const res = await sshClient.exec('cat /etc/serverRemote.json');
      let config;
      if (!res) {
        config = {};
      } else {
        config = JSON.parse(res) as Config;
      }
      console.log('configinner', config);
      setConfig(config === null ? {} : config);
    };
    fetchJson();
  }, [sshClient]);
  if (config == null) {
    console.log('config', config);
    return <Spin />;
  }
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
        name="generic"
        options={{
          headerShown: false,
          href: null,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'search' : 'search-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      {/* {Object.keys(config?.tabs || {}).map((key, index) => {
        const tab = config?.tabs[key];
        if (!tab) return;
        console.log(config);
        console.log(tab.name);
        return (
          <Tabs.Screen
            key={index}
            name={'generic'}
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
      })} */}
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
