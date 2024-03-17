import React, { useState } from 'react';
import { useToastController } from '@tamagui/toast'
import { Button, Input, Sheet, TextArea, XStack } from 'tamagui';
import { Server } from './types';
import SSHClient from '@jowparks/react-native-ssh-sftp'
import LabeledInput from './components/labeled-input';


type AddServerModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddServer: (server: Server) => void; 
};

export default function AddServerModal({ onAddServer, open, onOpenChange }: AddServerModalProps) {

  const [position, setPosition] = useState(0)
  const [serverDetails, setServerDetails] = useState<Server>({ host: '', port: 22, user: '' });

  const handleAddServer = () => {
    console.log('Adding server', serverDetails);
    onAddServer(serverDetails);
    onOpenChange(false);
  };


  const handleTestConnection = async () => {
    console.log('Testing connection', serverDetails);
    if (!serverDetails.password && !serverDetails.key) {
      console.log('No password or key');
      return;
    }
    let connection
    if (serverDetails.password) {
      const client = await SSHClient.connectWithPassword(
        serverDetails.host,
        serverDetails.port,
        serverDetails.user,
        serverDetails.password,
        (err, _) => {
          err ? console.log(err) : console.log('success')
        }
      )
    }
    if (serverDetails.key) {
        await SSHClient.connectWithKey(
        serverDetails.host, 
        serverDetails.port, 
        serverDetails.user, 
        serverDetails.key, 
        serverDetails.keyPassphrase,
        (err, _) => {
          err ? console.log(err) : console.log('success')
        }
      )
    }
  }

  return (
    <>
      <Sheet
        forceRemoveScrollEnabled={open}
        modal={true}
        open={open}
        onOpenChange={onOpenChange}
        snapPoints={[95, 10]}
        snapPointsMode={'percent'}
        dismissOnSnapToBottom
        position={position}
        onPositionChange={setPosition}
        // animation="medium"
      >
      <Sheet.Overlay
        animation="lazy"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />
      <Sheet.Handle />
      <Sheet.Frame padding="$4" justifyContent="center" alignItems="center" space="$5">
        <LabeledInput label='Name' autoCapitalize='none' placeholder="home server" size="$4" style={{ marginTop: 20, width: '90%' }} value={serverDetails.name} onChange={(e) => setServerDetails({ ...serverDetails, name: e.nativeEvent.text})} />
        <LabeledInput label='Host' autoCapitalize='none' placeholder="192.168.1.11" size="$4" style={{  width: '90%' }} value={serverDetails.host} onChange={(e) => setServerDetails({ ...serverDetails, host: e.nativeEvent.text })} />
        <LabeledInput label='Port' autoCapitalize='none' placeholder="22" size="$4" style={{   width: '90%' }} value={serverDetails.port.toString()} onChange={(e) => setServerDetails({ ...serverDetails, port: Number(e.nativeEvent.text.replace(/[^0-9]/g, '')) })} />
        <LabeledInput label='User' autoCapitalize='none' placeholder="root" size="$4" style={{   width: '90%' }} value={serverDetails.user} onChange={(e) => setServerDetails({ ...serverDetails, user: e.nativeEvent.text })} />
        <LabeledInput label='Password' autoCapitalize='none' placeholder="password" size="$4" style={{ width: '90%' }} value={serverDetails.password} onChange={(e) => setServerDetails({ ...serverDetails, password: e.nativeEvent.text })} />
        <TextArea autoCapitalize='none' placeholder="Key (-----BEGIN RSA...) " size="$4" style={{ width: '90%' }} value={serverDetails.key} onChange={(e) => setServerDetails({ ...serverDetails, key: e.nativeEvent.text })} />
        <LabeledInput label='Key Passphrase' autoCapitalize='none' placeholder="password" size="$4" style={{ width: '90%' }} value={serverDetails.keyPassphrase} onChange={(e) => setServerDetails({ ...serverDetails, keyPassphrase: e.nativeEvent.text })} />
        <XStack >
          <Button onPress={() => handleAddServer()} size="$4">Submit</Button>
          <Button onPress={async () => handleTestConnection()} size="$4">Test</Button>
        </XStack>
      </Sheet.Frame>
    </Sheet>
  </>
  );
}
