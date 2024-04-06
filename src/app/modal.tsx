import React, { useEffect, useState } from 'react';
import { Button, Sheet, TextArea, XStack, Text, View } from 'tamagui';
import SSHClient from '@jowparks/react-native-ssh-sftp';
import LabeledInput from '../components/labeled-input';
import { Server } from '../typing/server';

type ServerModalProps = {
  open: boolean;
  server?: Server;
  onOpenChange: (open: boolean) => void;
  onSaveServer: (server: Server) => void;
};

export default function ServerModal({
  onSaveServer,
  server,
  open,
  onOpenChange,
}: ServerModalProps) {
  const [position, setPosition] = useState(0);
  const [serverDetails, setServerDetails] = useState<Server>(
    server ?? {
      host: '',
      port: 22,
      user: '',
    },
  );
  const [testResult, setTestResult] = useState('');

  useEffect(() => {
    if (server) {
      setServerDetails(server);
    }
  }, [server]);

  const handleAddServer = () => {
    setTestResult('');
    onSaveServer(serverDetails);
    onOpenChange(false);
  };

  // TODO better handling of making keyboard disappear
  const handleTestConnection = async () => {
    console.log('Testing connection', serverDetails);
    if (!serverDetails.password && !serverDetails.key) {
      // TODO handle validation errors in fields
      console.log('No password or key');
      return;
    }
    if (serverDetails.password) {
      const client = await SSHClient.connectWithPassword(
        serverDetails.host,
        serverDetails.port,
        serverDetails.user,
        serverDetails.password,
        (err, _) => {
          if (err) {
            //TODO better handling/display of error
            setTestResult('Fail: ' + err);
          } else {
            setTestResult('Success');
          }
        },
      );
    }
    if (serverDetails.key) {
      await SSHClient.connectWithKey(
        serverDetails.host,
        serverDetails.port,
        serverDetails.user,
        serverDetails.key,
        serverDetails.publicKey,
        serverDetails.keyPassphrase,
        (err, _) => {
          if (err) {
            setTestResult('Fail: ' + err);
          } else {
            setTestResult('Success');
          }
        },
      );
    }
  };

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
        <Sheet.Frame>
          <View
            justifyContent="center"
            padding="$4"
            space="$5"
            alignItems="center"
          >
            <LabeledInput
              label="Name"
              autoCapitalize="none"
              placeholder="home server"
              size="$4"
              style={{ marginTop: 20, width: '90%' }}
              value={serverDetails.name}
              onChange={(e) =>
                setServerDetails({ ...serverDetails, name: e.nativeEvent.text })
              }
            />
            <LabeledInput
              label="Host"
              autoCapitalize="none"
              placeholder="192.168.1.11"
              size="$4"
              style={{ width: '90%' }}
              value={serverDetails.host}
              onChange={(e) =>
                setServerDetails({ ...serverDetails, host: e.nativeEvent.text })
              }
            />
            <LabeledInput
              label="Port"
              autoCapitalize="none"
              placeholder="22"
              size="$4"
              style={{ width: '90%' }}
              value={serverDetails.port.toString()}
              onChange={(e) =>
                setServerDetails({
                  ...serverDetails,
                  port: Number(e.nativeEvent.text.replace(/[^0-9]/g, '')),
                })
              }
            />
            <LabeledInput
              label="User"
              autoCapitalize="none"
              placeholder="root"
              size="$4"
              style={{ width: '90%' }}
              value={serverDetails.user}
              onChange={(e) =>
                setServerDetails({ ...serverDetails, user: e.nativeEvent.text })
              }
            />
            <LabeledInput
              label="Password"
              autoCapitalize="none"
              placeholder="password"
              size="$4"
              style={{ width: '90%' }}
              value={serverDetails.password}
              onChange={(e) =>
                setServerDetails({
                  ...serverDetails,
                  password: e.nativeEvent.text,
                })
              }
            />
            <TextArea
              autoCapitalize="none"
              placeholder="Key (-----BEGIN RSA...) "
              size="$4"
              style={{ width: '90%' }}
              value={serverDetails.key}
              onChange={(e) =>
                setServerDetails({ ...serverDetails, key: e.nativeEvent.text })
              }
            />
            <LabeledInput
              label="Key Passphrase"
              autoCapitalize="none"
              placeholder="password"
              size="$4"
              style={{ width: '90%' }}
              value={serverDetails.keyPassphrase}
              onChange={(e) =>
                setServerDetails({
                  ...serverDetails,
                  keyPassphrase: e.nativeEvent.text,
                })
              }
            />
          </View>
          <XStack alignItems="center" justifyContent="flex-end" gap="$2">
            {!!testResult && (
              <Text
                style={{ color: testResult == 'Success' ? 'green' : 'red' }}
              >
                {testResult}
              </Text>
            )}
            <Button onPress={async () => handleTestConnection()} size="$4">
              Test
            </Button>
            <Button onPress={() => handleAddServer()} size="$4">
              Submit
            </Button>
          </XStack>
        </Sheet.Frame>
      </Sheet>
    </>
  );
}
