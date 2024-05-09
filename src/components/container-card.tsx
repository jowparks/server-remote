import { Pause, Play, RefreshCcw, Square } from '@tamagui/lucide-icons';
import React from 'react';
import { Button, Text, ListItem, Paragraph, XStack, YStack } from 'tamagui';
import TransparentButton from './transparent-button';

// TODO add icon props for container (either image or url)
type ContainerCardProps = {
  name: string;
  subheading: string;
  running: boolean;
  paused: boolean;
  stopped: boolean;
  listItemStyle?: React.CSSProperties;
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
    onCardPress,
    onStart,
    onStop,
    onRestart,
    onPause,
  } = props;
  return (
    <ListItem
      elevate
      size="$4"
      bordered
      onPress={onCardPress}
      style={listItemStyle}
    >
      <YStack>
        <Text fontSize={16}>{name}</Text>
        <Paragraph theme="alt2">{subheading}</Paragraph>
      </YStack>
      <XStack
        style={{
          position: 'absolute',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      >
        <TransparentButton
          style={{ padding: 1 }}
          onPress={() => onStart()}
          disabled={running}
        >
          <Play maxWidth={16} opacity={running ? 0.5 : 1} />
        </TransparentButton>
        <TransparentButton
          style={{ padding: 1 }}
          onPress={() => onPause()}
          disabled={paused}
        >
          <Pause maxWidth={16} opacity={paused ? 0.5 : 1} />
        </TransparentButton>
        <TransparentButton
          style={{ padding: 1 }}
          onPress={() => onStop()}
          disabled={stopped}
        >
          <Square maxWidth={16} opacity={stopped ? 0.5 : 1} />
        </TransparentButton>
        <TransparentButton style={{ padding: 1 }} onPress={() => onRestart()}>
          <RefreshCcw maxWidth={16} />
        </TransparentButton>
      </XStack>
    </ListItem>
  );
}
