import React from 'react';
import { ListItem, Separator, View, YGroup, Text, Sheet } from 'tamagui';
import { FileInfo, fileInfoKeyMap } from '../../../util/files/util';
import { DarkBlueTheme } from '../../../style/theme';

export type InfoScreenProps = {
  open: boolean;
  file: FileInfo | null;
  onOpenChange: (open: boolean) => void;
};

function remapObjectValues(obj: Record<string, any>, keyMap: KeyMap) {
  return Object.keys(obj).reduce(
    (newObj, key) => {
      newObj[key] = keyMap[key] ? keyMap[key][obj[key]] || obj[key] : obj[key];
      return newObj;
    },
    {} as Record<string, any>,
  );
}

// maps Key: { oldValue: newValue}
type KeyMap = Record<string, Record<string, string>>;

const mapping: KeyMap = {
  fileType: {
    d: 'directory',
    f: 'file',
    l: 'link',
  },
};

export default function InfoScreen({
  open,
  onOpenChange,
  file,
}: InfoScreenProps) {
  if (!file || !open) return null;
  const mappedFile = remapObjectValues(file, mapping);
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
            {Object.keys(mappedFile).map((key) => (
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
                  <Text>{mappedFile[key]}</Text>
                </ListItem>
              </YGroup.Item>
            ))}
          </YGroup>
        </View>
      </Sheet.Frame>
    </Sheet>
  );
}
