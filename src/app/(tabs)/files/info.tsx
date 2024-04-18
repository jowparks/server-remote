import { Link } from 'expo-router';
import React from 'react';
import { ListItem, Separator, View, YGroup, Text } from 'tamagui';

export default function InfoScreen() {
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
          <ListItem
            elevate
            size="$4"
            bordered
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text>File Size</Text>
            <Text>1024 KB</Text>
          </ListItem>
          <ListItem
            elevate
            size="$4"
            bordered
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text>Last Modified</Text>
            <Text>2022-01-01</Text>
          </ListItem>
        </YGroup.Item>
      </YGroup>
    </View>
  );
}
