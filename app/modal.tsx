import React, { useState } from 'react';
import { Box, Button, Input, Sheet } from 'tamagui';

export type ServerData = { host: string, port: string, user: string, password?: string, key?: string, passphrase?: string, name?: string };

type AddServerModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddServer: (server: ServerData) => void; 
};

export default function AddServerModal({ onAddServer, open, onOpenChange }: AddServerModalProps) {
  const [position, setPosition] = useState(0)
  const [serverDetails, setServerDetails] = useState<ServerData>({ host: '', port: '', user: '', password: '', key: '', passphrase: '', name: '' });

  const handleAddServer = () => {
    onAddServer(serverDetails);
    onOpenChange(false);
  };
  return (
    <Sheet
    forceRemoveScrollEnabled={open}
    modal={true}
    open={open}
    onOpenChange={onOpenChange}
    snapPoints={[85, 50, 25]}
    snapPointsMode={'percent'}
    dismissOnSnapToBottom
    position={position}
    onPositionChange={setPosition}
    zIndex={100_000}
    // animation="medium"
  >
    <Sheet.Overlay
      animation="lazy"
      enterStyle={{ opacity: 0 }}
      exitStyle={{ opacity: 0 }}
    />
    <Sheet.Handle />
    <Sheet.Frame padding="$4" justifyContent="center" alignItems="center" space="$5">
      <Input width={200} />
    </Sheet.Frame>
  </Sheet>
  );
}