import { Link, Navigator, Slot } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { DarkBlueTheme } from '../../style/theme';
import { useSsh } from '../../contexts/ssh';
import { useGenericScreen } from '../../contexts/generic';
import { Config } from '../../components/generic/types';
import Spin from '../../components/general/spinner';

export const unstable_settings = {
  initialRouteName: 'index',
};

type Icons = keyof typeof Ionicons.glyphMap;

export default function Layout() {
  const { config, setConfig, setCurrentTab } = useGenericScreen();
  const { sshClient } = useSsh();
  useEffect(() => {
    if (!sshClient) return;
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
    return <Spin />;
  }
  return (
    <View style={{ flex: 1 }}>
      <Navigator>
        <Slot />
        <CustomTabBar tabConfig={config} />
      </Navigator>
    </View>
  );
}

function CustomTabBar(props: { tabConfig: Config }) {
  const { tabConfig } = props;
  return (
    <View
      style={{
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        backgroundColor: DarkBlueTheme.colors.background,
        paddingVertical: 10,
        borderTopColor: DarkBlueTheme.colors.border,
        borderTopWidth: 1,
      }}
    >
      <Tab
        name="docker"
        href="/(tabs)/docker"
        title="Docker"
        iconFocused="logo-docker"
        iconUnfocused="logo-docker"
      />
      <Tab
        name="vm"
        href="/(tabs)/vm"
        title="VM"
        iconFocused="desktop-outline"
        iconUnfocused="desktop-outline"
      />
      <Tab
        name="files"
        href="/(tabs)/files"
        title="Files"
        iconFocused="folder-outline"
        iconUnfocused="folder-outline"
      />
      {Object.keys(tabConfig?.tabs || {}).map((key, index) => {
        const tab = tabConfig?.tabs ? tabConfig.tabs[key] : null;
        if (!tab) return;
        console.log(tabConfig);
        console.log(tab.name);
        return (
          <Tab
            key={index}
            tabKey={key}
            name={tab.name}
            href={`/(tabs)/generic`}
            title={tab.name}
            iconFocused="add"
            iconUnfocused="add"
          />
        );
      })}
    </View>
  );
}

function useIsTabSelected(name: string): boolean {
  const { state } = Navigator.useContext();
  const current = state.routes.find((route, i) => state.index === i);
  console.log(current?.name);
  console.log(name);
  return current?.name === name;
}

function Tab({
  name,
  title,
  tabKey,
  href,
  iconFocused,
  iconUnfocused,
  style,
}: {
  name: string;
  title: string;
  tabKey?: string;
  href: string;
  iconFocused: Icons;
  iconUnfocused: Icons;
  style?: ViewStyle;
}) {
  const focused = useIsTabSelected(name);
  const params = tabKey ? `?tabName=${tabKey}` : '';
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Link href={href + params} asChild style={style}>
        <Pressable>
          <View style={{ alignItems: 'center', opacity: focused ? 1 : 0.5 }}>
            <Ionicons
              name={focused ? iconFocused : iconUnfocused}
              size={24}
              color="white"
            />
            <Text style={styles.link}>{title}</Text>
          </View>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  link: {
    fontSize: 12,
    color: 'white',
    paddingHorizontal: 24,
  },
});
