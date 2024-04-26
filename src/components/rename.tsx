import React, { useState } from 'react';
import { Button, Input, View, Sheet, XStack } from 'tamagui';
import { DarkBlueTheme } from '../style/theme';

export type RenameModalProps = {
  open: boolean;
  originalName: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: (name: string) => void;
  onCancel: () => void;
};

export default function RenameModal({
  open,
  originalName,
  onOpenChange,
  onConfirm,
  onCancel,
}: RenameModalProps) {
  const [newName, setNewName] = useState(originalName);

  const handleNewNameChange = (e) => {
    setNewName(e.nativeEvent.text);
  };

  return (
    <Sheet
      forceRemoveScrollEnabled={open}
      modal={true}
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[45, 10]}
      snapPointsMode={'percent'}
      dismissOnSnapToBottom
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
        >
          <Input value={newName} width={'90%'} onChange={handleNewNameChange} />
          <XStack gap="$2">
            <Button
              onPress={() => {
                console.log('inner', newName);
                onConfirm(newName);
              }}
            >
              Confirm
            </Button>
            <Button onPress={onCancel}>Cancel</Button>
          </XStack>
        </View>
      </Sheet.Frame>
    </Sheet>
  );
}
