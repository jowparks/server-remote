import React from 'react';
import { ListItem, Separator, View, YGroup } from 'tamagui';

export default function MenuScreen() {
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
            onPress={() => console.log('details')}
          >
            Details
          </ListItem>
        </YGroup.Item>
      </YGroup>
    </View>
  );
}
