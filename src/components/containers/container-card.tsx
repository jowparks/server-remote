import { Pause, Play, RefreshCcw, Square } from '@tamagui/lucide-icons';
import React, { useEffect } from 'react';
import {
  Text,
  ListItem,
  Paragraph,
  XStack,
  YStack,
  View,
  Image,
} from 'tamagui';
import TransparentButton from '../general/transparent-button';

// TODO add icon props for container (either image or url)
type ContainerCardProps = {
  name: string;
  subheading: string;
  running: boolean;
  paused: boolean;
  stopped: boolean;
  listItemStyle?: React.CSSProperties;
  iconUrl: string;
  onCardPress: () => void;
  onStart: () => void;
  onStop: () => void;
  onRestart: () => void;
  onPause: () => void;
};

export default function ContainerCard(props: ContainerCardProps) {
  const {
    name,
    subheading,
    running,
    paused,
    stopped,
    listItemStyle,
    iconUrl,
    onCardPress,
    onStart,
    onStop,
    onRestart,
    onPause,
  } = props;

  useEffect(() => {
    setDisabled(false);
  }, [running, paused, stopped]);

  const [disabled, setDisabled] = React.useState(false);
  return (
    <ListItem
      elevate
      disabled={disabled}
      size="$4"
      bordered
      onPress={onCardPress}
      style={listItemStyle}
    >
      <XStack alignItems="center" justifyContent="space-between" width="100%">
        <View width="50%">
          <XStack alignItems="center" gap="$2">
            <Image
              source={{ uri: iconUrl }}
              style={{ width: 30, height: 30 }}
            />
            <YStack>
              <Text fontSize={14}>{name}</Text>
              <Paragraph theme="alt2" fontSize={12}>
                {subheading}
              </Paragraph>
            </YStack>
          </XStack>
        </View>
        <XStack>
          <TransparentButton
            style={{ padding: 1 }}
            onPress={() => {
              setDisabled(true);
              onStart();
            }}
            disabled={running}
          >
            <Play maxWidth={16} opacity={running ? 0.5 : 1} />
          </TransparentButton>
          <TransparentButton
            style={{ padding: 1 }}
            onPress={() => {
              setDisabled(true);
              onPause();
            }}
            disabled={paused}
          >
            <Pause maxWidth={16} opacity={paused ? 0.5 : 1} />
          </TransparentButton>
          <TransparentButton
            style={{ padding: 1 }}
            onPress={() => {
              setDisabled(true);
              onStop();
            }}
            disabled={stopped}
          >
            <Square maxWidth={16} opacity={stopped ? 0.5 : 1} />
          </TransparentButton>
          <TransparentButton
            style={{ padding: 1 }}
            onPress={() => {
              setDisabled(true);
              onRestart();
            }}
          >
            <RefreshCcw maxWidth={16} />
          </TransparentButton>
        </XStack>
      </XStack>
    </ListItem>
  );
}
