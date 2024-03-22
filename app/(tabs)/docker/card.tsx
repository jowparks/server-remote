import { Pause, Play, RefreshCcw, Square } from '@tamagui/lucide-icons';
import { Button, H5, ListItem, Paragraph, XStack, YStack } from 'tamagui';

type DockerCardProps = {
  container: DockerContainer;
  onStart: () => void;
  onStop: () => void;
  onRestart: () => void;
  onPause: () => void;
};

export default function DockerCard(props: DockerCardProps) {
  const { container, onStart, onStop, onRestart, onPause } = props;
  return (
    <ListItem elevate size="$4" bordered>
      <YStack>
        <H5>{container.Image?.split('/').pop()}</H5>
        <Paragraph theme="alt2">{container.State}</Paragraph>
      </YStack>
      <XStack
        style={{
          position: 'absolute',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      >
        {/* TODO make buttons disabled properly when container is in certain states */}
        {/* TODO add formatter to project */}
        <Button
          transparent
          style={{ padding: 1 }}
          onPress={() => onStart()}
          disabled={container.State === 'running'}
        >
          <Play
            maxWidth={16}
            opacity={container.State === 'running' ? 0.5 : 1}
          />
        </Button>
        <Button
          transparent
          style={{ padding: 1 }}
          onPress={() => onPause()}
          disabled={container.State === 'paused'}
        >
          <Pause
            maxWidth={16}
            opacity={container.State === 'paused' ? 0.5 : 1}
          />
        </Button>
        <Button
          transparent
          style={{ padding: 1 }}
          onPress={() => onStop()}
          disabled={container.State === 'exited'}
        >
          <Square
            maxWidth={16}
            opacity={container.State === 'exited' ? 0.5 : 1}
          />
        </Button>
        <Button transparent style={{ padding: 1 }} onPress={() => onRestart()}>
          <RefreshCcw maxWidth={16} />
        </Button>
      </XStack>
    </ListItem>
  );
}
