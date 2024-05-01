import { Link } from 'expo-router';
import React from 'react';
import { ListItem, Separator, View, YGroup } from 'tamagui';

export default function SettingsScreen() {
  return (
    <View flex={1} alignItems="center">
      <YGroup
        alignSelf="center"
        bordered
        width={'90%'}
        size="$5"
        separator={<Separator />}
      >
        <YGroup.Item>
          <Link href="/settings/info">
            <ListItem elevate size="$4" bordered>
              App Info
            </ListItem>
          </Link>
        </YGroup.Item>
      </YGroup>
    </View>
  );
}
