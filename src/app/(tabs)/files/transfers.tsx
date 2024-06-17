import React from 'react';
import {
  ListItem,
  Separator,
  View,
  YGroup,
  Text,
  Sheet,
  XStack,
  YStack,
  Progress,
  Spacer,
} from 'tamagui';
import { DarkBlueTheme } from '../../../style/theme';
import { useTransfers } from '../../../contexts/transfers';
import { ArrowDown, ArrowRight } from '@tamagui/lucide-icons';
import { formatBytes } from '../../../util/files';

export type TransferScreenProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function TransferScreen({
  open,
  onOpenChange,
}: TransferScreenProps) {
  const { transfers } = useTransfers();
  if (!open) return null;
  return (
    <Sheet
      forceRemoveScrollEnabled={open}
      modal={true}
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[95]}
      snapPointsMode={'percent'}
      dismissOnSnapToBottom
      // animation="medium"
    >
      <Sheet.Overlay
        animation="lazy"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />
      <Sheet.Handle backgroundColor={DarkBlueTheme.colors.notification} />
      <Sheet.Frame>
        <View
          justifyContent="center"
          padding="$4"
          space="$5"
          alignItems="center"
        ></View>
        <View flex={1} alignItems="center">
          <YGroup
            alignSelf="center"
            bordered
            width={'90%'}
            size="$5"
            separator={<Separator />}
          >
            {transfers.map((transfer) => (
              <YGroup.Item key={transfer.id}>
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
                  <YStack>
                    <Text>{transfer.filename}</Text>
                    <Spacer />
                    <Progress
                      value={
                        (transfer.transferredBytes / transfer.totalBytes) * 100
                      }
                    >
                      <Progress.Indicator />
                    </Progress>
                    <Spacer />
                    <Text>
                      {formatBytes(transfer.transferredBytes)}
                      {' / '}
                      {formatBytes(transfer.totalBytes)}
                    </Text>
                  </YStack>
                </ListItem>
              </YGroup.Item>
            ))}
          </YGroup>
        </View>
      </Sheet.Frame>
    </Sheet>
  );
}
