import { Link } from 'expo-router';
import React from 'react';
import { ListItem, Separator, View, YGroup, Spacer, ScrollView } from 'tamagui';

export default function SettingsScreen() {
  return (
    <View flex={1} width={'90%'} alignItems="center" alignSelf="center">
      <ScrollView width="100%">
        <Spacer size="4%" />
        <YGroup size="$5" width="100%" separator={<Separator />}>
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
              <ListItem elevate size="$4" bordered>
                App Settings
              </ListItem>
            </Link>
            <Link href="/settings/tabs">
              <ListItem
                elevate
                size="$4"
                bordered
                style={{
                  borderBottomLeftRadius: 10,
                  borderBottomRightRadius: 10,
                }}
              >
                Tabs
              </ListItem>
            </Link>
          </YGroup.Item>
        </YGroup>
      </ScrollView>
    </View>
  );
}
