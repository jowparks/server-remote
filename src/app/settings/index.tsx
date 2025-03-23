import { Link } from 'expo-router';
import React from 'react';
import { ListItem, Separator, View, YGroup, Spacer, ScrollView } from 'tamagui';
import { StyleSheet } from 'react-native';

export default function SettingsScreen() {
  return (
    <View flex={1} padding="5%" paddingTop="4%">
      <ScrollView width="100%">
        <YGroup size="$5" style={styles.container} separator={<Separator />}>
          <YGroup.Item>
            <Link href="/settings/info" asChild>
              <ListItem
                elevate
                size="$4"
                bordered
                style={styles.listItem}
                borderTopLeftRadius={10}
                borderTopRightRadius={10}
              >
                App Info
              </ListItem>
            </Link>
            <Link href="/settings/app" asChild>
              <ListItem elevate size="$4" bordered style={styles.listItem}>
                App Settings
              </ListItem>
            </Link>
            <Link href="/settings/tabs" asChild>
              <ListItem
                elevate
                size="$4"
                bordered
                style={styles.listItem}
                borderBottomLeftRadius={10}
                borderBottomRightRadius={10}
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

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  listItem: {
    width: '100%',
  },
});
