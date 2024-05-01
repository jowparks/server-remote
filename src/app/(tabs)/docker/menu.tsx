import { Link } from 'expo-router';
import React from 'react';
import { ListItem, Separator, View, YGroup } from 'tamagui';

export default function MenuScreen() {
  return (
    <View flex={1} alignItems="center" padding={'$4'}>
      <YGroup alignSelf="center" width={'90%'} size="$5">
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
