import { Link, Navigator, Slot } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { DarkBlueTheme } from '../../style/theme';
import { useSsh } from '../../contexts/ssh';
import { useGenericScreen } from '../../contexts/generic';
import { Config } from '../../components/generic/types';
import Spin from '../../components/general/spinner';
import { Icons } from '../../util/icon';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function Layout() {
  const { config, setConfig, setCurrentTab } = useGenericScreen();
  const { sshClient } = useSsh();
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
        justifyContent: 'space-evenly',
        backgroundColor: DarkBlueTheme.colors.background,
        paddingVertical: 10,
        borderTopColor: DarkBlueTheme.colors.border,
        borderLeftColor: DarkBlueTheme.colors.border,
        borderTopWidth: 1,
      }}
    >
      <Tab
        id="docker"
        href="/(tabs)/docker"
        title="Docker"
        iconFocused="logo-docker"
        iconUnfocused="logo-docker"
      />
      <Tab
        id="vm"
        href="/(tabs)/vm"
        title="VM"
        iconFocused="desktop-outline"
        iconUnfocused="desktop-outline"
      />
      <Tab
        id="files"
        href="/(tabs)/files"
        title="Files"
        iconFocused="folder-outline"
        iconUnfocused="folder-outline"
      />
      {Object.keys(tabConfig?.tabs || {}).map((key, index) => {
        const tab = tabConfig?.tabs ? tabConfig.tabs[key] : null;
        if (!tab) return;
        return (
          <Tab
            id={key}
            key={index}
            href={`/(tabs)/generic/template`}
            title={tab.name}
            iconFocused={tab.icon as Icons}
            iconUnfocused={tab.icon as Icons}
          />
        );
      })}
    </View>
  );
}

function useIsTabSelected(currentTab: string, name: string): boolean {
  return currentTab === name;
}

function Tab({
  id,
  title,
  href,
  iconFocused,
  iconUnfocused,
  style,
}: {
  id: string;
  title: string;
  href: string;
  iconFocused: Icons;
  iconUnfocused: Icons;
  style?: ViewStyle;
}) {
  const { currentTab, setCurrentTab } = useGenericScreen();
  const focused = useIsTabSelected(currentTab, id);

  const handlePress = () => {
    setCurrentTab(id);
  };
  return (
    <View
      style={{ flex: 0, alignItems: 'center', overflow: 'visible', width: 100 }}
    >
      <Link push href={href} asChild style={style}>
        <Pressable onPress={handlePress}>
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
    fontSize: 10,
    color: 'white',
    paddingHorizontal: 24,
  },
});
