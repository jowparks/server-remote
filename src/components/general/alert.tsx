import React, { useState } from 'react';
import { AlertDialog, Button, XStack, YStack } from 'tamagui';

export type AlertProps = {
  title: string;
  description: string;
  onOk: () => void;
  onCancel?: () => void;
  open?: boolean;
  children?: React.ReactNode;
  danger?: boolean;
  okText?: string;
  cancelText?: string;
};

export default function Alert({
  title,
  description,
  onOk,
  onCancel,
  children,
  open,
  danger = false,
  cancelText = 'Cancel',
  okText = 'Ok',
}: AlertProps) {
  return (
    <AlertDialog native open={open}>
      <AlertDialog.Trigger asChild>{children}</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          key="overlay"
          animation="quick"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />

        <AlertDialog.Content
          bordered
          elevate
          key="content"
          animation={[
            'quick',
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          x={0}
          scale={1}
          opacity={1}
          y={0}
        >
          <YStack space>
            <AlertDialog.Title>{title}</AlertDialog.Title>

            <AlertDialog.Description>{description}</AlertDialog.Description>
            <XStack space="$3" justifyContent="flex-end">
              {!!onCancel && (
                <AlertDialog.Cancel onPress={onCancel} asChild>
                  <Button>{cancelText}</Button>
                </AlertDialog.Cancel>
              )}
              <AlertDialog.Action onPress={onOk} asChild>
                <Button theme="active">{okText}</Button>
              </AlertDialog.Action>
            </XStack>
          </YStack>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog>
  );
}
