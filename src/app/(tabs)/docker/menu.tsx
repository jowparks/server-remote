import { Link } from 'expo-router';
import React from 'react';
import { ListItem, Separator, Spacer, View, YGroup } from 'tamagui';

export default function MenuScreen() {
  return (
    <View flex={1} width="90%" alignItems="center" alignSelf="center">
      <Spacer size="$4" />
      <YGroup flexGrow={1} alignSelf="center" size="$5">
        <YGroup.Item>
          <Link href="/(tabs)/docker/details">
            <ListItem
              elevate
              size="$4"
              bordered
              style={{
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10,
              }}
            >
              Details
            </ListItem>
          </Link>
          <Link href="/(tabs)/docker/logs">
            <ListItem
              elevate
              size="$4"
              bordered
              style={{
                borderBottomLeftRadius: 10,
                borderBottomRightRadius: 10,
              }}
            >
              Logs
            </ListItem>
          </Link>
        </YGroup.Item>
      </YGroup>
    </View>
  );
}
