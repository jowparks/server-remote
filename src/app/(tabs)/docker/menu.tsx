import { Link, useRouter } from 'expo-router';
import React from 'react';
import { ListItem, Separator, View, YGroup } from 'tamagui';

export default function MenuScreen() {
  const router = useRouter(); // get the router object

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
          <Link href="/(tabs)/docker/details">
            <ListItem elevate size="$4" bordered>
              Details
            </ListItem>
          </Link>
          <Link href="/(tabs)/docker/logs">
            <ListItem elevate size="$4" bordered>
              Logs
            </ListItem>
          </Link>
        </YGroup.Item>
      </YGroup>
    </View>
  );
}
