import React, { useEffect } from 'react';
import { ListItem, Separator, View, YGroup, Text, Sheet } from 'tamagui';
import { useFiles } from '../../../contexts/files';
import { FileInfo, fileInfoKeyMap } from '../../../util/files/util';
import { useNavigation } from 'expo-router';
import { DarkBlueTheme } from '../../../style/theme';

export type InfoScreenProps = {
  open: boolean;
  file: FileInfo | null;
  onOpenChange: (open: boolean) => void;
};

export default function InfoScreen({
  open,
  onOpenChange,
  file,
}: InfoScreenProps) {
  if (!file || !open) return null;
  return (
    <Sheet
      forceRemoveScrollEnabled={open}
      modal={true}
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[95, 10]}
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
            {Object.keys(file).map((key) => (
              <YGroup.Item key={key}>
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
                  <Text>{fileInfoKeyMap[key]}</Text>
                  <Text>{file[key]}</Text>
                </ListItem>
              </YGroup.Item>
            ))}
          </YGroup>
        </View>
      </Sheet.Frame>
    </Sheet>
  );
}
