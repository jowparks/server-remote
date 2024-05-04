import { Link } from 'expo-router';
import React from 'react';
import { ListItem, Separator, View, YGroup } from 'tamagui';

export default function SettingsScreen() {
  // TODO: listitem not actually 90% width
  return (
    <YGroup alignSelf="center" padding="$4" size="$5" separator={<Separator />}>
      <YGroup.Item>
        <Link href="/settings/info">
          <ListItem
            elevate
            size="$4"
            bordered
            style={{ borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
          >
            App Info
          </ListItem>
        </Link>
        <Link href="/settings/app">
          <ListItem
            elevate
            size="$4"
            bordered
            style={{ borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}
          >
            App Settings
          </ListItem>
        </Link>
      </YGroup.Item>
    </YGroup>
  );
}
