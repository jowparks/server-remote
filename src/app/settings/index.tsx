import { Link } from 'expo-router';
import React from 'react';
import { ListItem, Separator, YGroup } from 'tamagui';

export default function SettingsScreen() {
  // TODO: listitem not actually 90% width
  return (
    <YGroup
      alignSelf="center"
      width={'90%'}
      padding="$4"
      size="$5"
      separator={<Separator />}
    >
      <YGroup.Item>
        <Link href="/settings/info">
          <ListItem elevate size="$4" bordered style={{ borderRadius: 10 }}>
            App Info
          </ListItem>
        </Link>
      </YGroup.Item>
    </YGroup>
  );
}
