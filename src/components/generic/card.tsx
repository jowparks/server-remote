import React from 'react';
import { Text, ListItem, Paragraph, XStack, YStack, View } from 'tamagui';

type GenericListCardProps = {
  name: string;
  subHeading: string;
  onCardPress: () => void;
  listItemStyle?: React.CSSProperties;
  contentWidth?: string;
};

export default function GenericListCard(props: GenericListCardProps) {
  const { name, subHeading, listItemStyle, contentWidth, onCardPress } = props;

  return (
    <ListItem
      elevate
      size="$4"
      bordered
      onPress={onCardPress}
      style={listItemStyle}
    >
      <XStack alignItems="center" justifyContent="space-between" width="100%">
        <View width={contentWidth ?? '50%'} marginLeft={-10}>
          <XStack alignItems="center" gap="$2">
            <YStack>
              <Text fontSize={14}>{name}</Text>
              <Paragraph theme="alt2" fontSize={12}>
                {subHeading}
              </Paragraph>
            </YStack>
          </XStack>
        </View>
      </XStack>
    </ListItem>
  );
}
