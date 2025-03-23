import { Link } from 'expo-router';
import React from 'react';
import { ListItem, Spacer, View, YGroup } from 'tamagui';
import { StyleSheet } from 'react-native';

export default function MenuScreen() {
  return (
    <View flex={1} padding="5%" paddingTop="4%">
      <YGroup size="$5" style={styles.container}>
        <YGroup.Item>
          <Link href="/(tabs)/docker/details" asChild>
            <ListItem
              elevate
              size="$4"
              bordered
              style={[styles.listItem]}
              borderTopLeftRadius={10}
              borderTopRightRadius={10}
            >
              Details
            </ListItem>
          </Link>
          <Link href="/(tabs)/docker/logs" asChild>
            <ListItem
              elevate
              size="$4"
              bordered
              style={[styles.listItem]}
              borderBottomLeftRadius={10}
              borderBottomRightRadius={10}
            >
              Logs
            </ListItem>
          </Link>
        </YGroup.Item>
      </YGroup>
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
