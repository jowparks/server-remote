import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { DarkBlueTheme } from '../../style/theme';
import { useSsh } from '../../contexts/ssh';
import { useGenericScreen } from '../../contexts/generic';
import { Config, GenericScreenType } from '../../components/generic/types';
import Spin from '../../components/general/spinner';
import { Icons } from '../../util/icon';

export const unstable_settings = {
  initialRouteName: 'index',
};

// TODO: go back to normal tabs and just add extras that don't render if config isn't present (generic1.tsx, generic2.tsx)
export default function Layout() {
  const { config, setConfig } = useGenericScreen();
  const { sshClient } = useSsh();
  const { setCurrentTab } = useGenericScreen();
  const [tabs, setTabs] = React.useState<GenericScreenType[]>([]);
  useEffect(() => {
    if (!sshClient) return;
    // TODO: handle when config fails to load, display something
    const fetchJson = async () => {
      const res = await sshClient.exec('cat /etc/serverRemote.json');
      let config;
      if (!res) {
        config = {};
      } else {
        config = JSON.parse(res) as Config;
      }
      setConfig(config === null ? {} : config);
      setTabs(config?.tabs ? Object.values(config.tabs) : []);
    };
    fetchJson();
  }, [sshClient]);
  if (config == null || tabs.length === 0) {
    return <Spin />;
  }
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
      {tabs.length > 0 ? (
        <Tabs.Screen
          name="generic"
          options={{
            title: tabs[0].name,
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name={tabs[0].icon as Icons}
                size={size}
                color={color}
              />
            ),
          }}
        />
      ) : (
        <Tabs.Screen name="generic" options={{ href: null }} />
      )}
      {tabs.length > 1 ? (
        <Tabs.Screen
          name="generic2"
          options={{
            title: tabs[1].name,
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name={tabs[1].icon as Icons}
                size={size}
                color={color}
              />
            ),
          }}
        />
      ) : (
        <Tabs.Screen name="generic2" options={{ href: null }} />
      )}
      {tabs.length > 2 ? (
        <Tabs.Screen
          name="generic3"
          options={{
            title: tabs[2].name,
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name={tabs[2].icon as Icons}
                size={size}
                color={color}
              />
            ),
          }}
        />
      ) : (
        <Tabs.Screen name="generic3" options={{ href: null }} />
      )}
    </Tabs>
  );
}
