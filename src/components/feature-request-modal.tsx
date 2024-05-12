import React, { useState } from 'react';
import { Button, Input, View, Sheet, XStack, TextArea } from 'tamagui';
import { DarkBlueTheme } from '../style/theme';

export type FeatureRequestModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (featureRequest: string) => void;
  onCancel: () => void;
};

export default function FeatureRequestModal({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
}: FeatureRequestModalProps) {
  const [featureRequest, setFeatureRequest] = useState('');

  const handleNewNameChange = (e) => {
    setFeatureRequest(e.nativeEvent.text);
  };

  return (
    <Sheet
      forceRemoveScrollEnabled={open}
      modal={true}
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[45]}
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
          flexGrow={1}
        >
          <TextArea
            value={featureRequest}
            width={'90%'}
            onChange={handleNewNameChange}
            flexGrow={1}
          />
          <XStack gap="$2">
            <Button
              onPress={() => {
                console.log('inner', featureRequest);
                onConfirm(featureRequest);
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
