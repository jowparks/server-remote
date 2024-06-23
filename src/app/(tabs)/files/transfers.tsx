import React from 'react';
import {
  ListItem,
  Separator,
  View,
  YGroup,
  Text,
  Sheet,
  YStack,
  Progress,
  Spacer,
  XStack,
} from 'tamagui';
import { DarkBlueTheme } from '../../../style/theme';
import { useTransfers } from '../../../contexts/transfers';
import { formatBytes } from '../../../util/files';
import TransparentButton from '../../../components/general/transparent-button';
import { useSsh } from '../../../contexts/ssh';
import { X } from '@tamagui/lucide-icons';

export type TransferScreenProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function TransferScreen({
  open,
  onOpenChange,
}: TransferScreenProps) {
  const { transfers, updateTransfer } = useTransfers();
  const { sshClient } = useSsh();
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
        <View flex={1} alignSelf="center" alignItems="center" width="90%">
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
                  <XStack
                    alignItems="center"
                    justifyContent="space-between"
                    width="100%"
                  >
                    <YStack width={'70%'}>
                      <Text>{transfer.filename}</Text>
                      <Spacer />
                      {transfer.status === 'cancelled' ? (
                        <Text>Cancelled</Text>
                      ) : (
                        <>
                          <Progress
                            backgroundColor={DarkBlueTheme.colors.card}
                            value={
                              (transfer.transferredBytes /
                                transfer.totalBytes) *
                              100
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
                        </>
                      )}
                    </YStack>
                    {/* TODO remove file on cancel */}
                    {transfer.status !== 'cancelled' &&
                      transfer.status !== 'complete' && (
                        <TransparentButton
                          onPress={() => {
                            sshClient?.cancel(transfer.id);
                            updateTransfer(transfer.id, {
                              ...transfer,
                              status: 'cancelled',
                            });
                          }}
                        >
                          <X />
                        </TransparentButton>
                      )}
                  </XStack>
                </ListItem>
              </YGroup.Item>
            ))}
          </YGroup>
        </View>
      </Sheet.Frame>
    </Sheet>
  );
}
