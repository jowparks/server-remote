import React, { useEffect, useState } from 'react';
import { Button, Sheet, XStack, Text, View, YStack, Spacer } from 'tamagui';
import LabeledInput from '../../components/general/labeled-input';
import { Server } from '../../typing/server';
import { DarkBlueTheme } from '../../style/theme';
import { useSsh } from '../../contexts/ssh';

type ServerModalProps = {
  open: boolean;
  server: Server | null;
  onOpenChange: (open: boolean) => void;
  onSaveServer: (server: Server) => void;
};

export default function ServerModal({
  onSaveServer,
  server,
  open,
  onOpenChange,
}: ServerModalProps) {
  const defaultServer = {
    host: '',
    port: 22,
    user: '',
  };
  const [serverDetails, setServerDetails] = useState<Server>(
    server ?? defaultServer,
  );
  const [testResult, setTestResult] = useState('');
  const { sshServer, connectToServer, sshClient } = useSsh();

  useEffect(() => {
    setServerDetails(server ?? defaultServer);
  }, [server]);

  const handleAddServer = () => {
    console.log('handle Add server', serverDetails);
    setTestResult('');
    onSaveServer(serverDetails);
    onOpenChange(false);
  };

  const handleTestConnection = async () => {
    console.log('Testing connection', serverDetails);
    if (!serverDetails.password && !serverDetails.key) {
      return;
    }

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject('Fail: Timeout after 5 seconds'), 5000),
    );

    const connectionPromise = new Promise(async (resolve, reject) => {
      await connectToServer({
        host: serverDetails.host,
        port: serverDetails.port,
        user: serverDetails.user,
        key: serverDetails.key,
        password: serverDetails.password,
      })
        .then(() => resolve('Great Success!'))
        .catch((reason) => reject(reason));
    });

    try {
      await Promise.race([connectionPromise, timeoutPromise]);
      setTestResult('Success');
    } catch (error) {
      setTestResult(error);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setTimeout(() => {
        onOpenChange(isOpen);
      }, 300);
    } else {
      onOpenChange(isOpen);
    }
  };
  return (
    <>
      <Sheet
        forceRemoveScrollEnabled={open}
        modal={true}
        open={open}
        onOpenChange={handleOpenChange}
        snapPoints={[95, 50]}
        dismissOnSnapToBottom
        dismissOnOverlayPress
        snapPointsMode={'percent'}
        animation="medium"
      >
        <Sheet.Overlay enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
        <Sheet.Handle backgroundColor={DarkBlueTheme.colors.notification} />
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
              secureTextEntry={true}
              onChange={(e) =>
                setServerDetails({
                  ...serverDetails,
                  password: e.nativeEvent.text,
                })
              }
            />
            {/* disabled for now, since we private key is not working */}
            {/* <TextArea
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
            /> */}
          </View>
          <YStack>
            <XStack
              alignItems="center"
              justifyContent="flex-end"
              gap="$2"
              paddingRight="10%"
            >
              <Button onPress={async () => handleTestConnection()} size="$4">
                Test
              </Button>
              <Button onPress={() => handleAddServer()} size="$4">
                Submit
              </Button>
            </XStack>
            <Spacer size="4%" />
            {!!testResult && (
              <View alignItems="center" alignContent="center" width="100%">
                <Text
                  style={{ color: testResult == 'Success' ? 'green' : 'red' }}
                  width="90%"
                  textAlign="center"
                >
                  {testResult}
                </Text>
              </View>
            )}
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </>
  );
}
