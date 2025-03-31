import React, { useEffect, useState } from 'react';
import {
  Button,
  Sheet,
  XStack,
  Text,
  View,
  YStack,
  Spacer,
  RadioGroup,
  TextArea,
} from 'tamagui';
import LabeledInput from '../../components/general/labeled-input';
import { Server } from '../../typing/server';
import { DarkBlueTheme } from '../../style/theme';
import { useSsh } from '../../contexts/ssh';
import DocumentPicker from 'react-native-document-picker';
import * as FileSystem from 'expo-file-system';

type AuthMethod = 'password' | 'keyFile' | 'pasteKey';

type ServerModalProps = {
  open: boolean;
  server: Server | null;
  onOpenChange: (open: boolean) => void;
  onSaveServer: (server: Server) => void;
};

// TODO: seems like when "Test" is clicked before "submit"
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
    password: '',
    key: '',
  };
  const [serverDetails, setServerDetails] = useState<Server>(
    server ?? defaultServer,
  );
  const [testResult, setTestResult] = useState('');
  const [authMethod, setAuthMethod] = useState<AuthMethod>('password');
  const [selectedKeyPath, setSelectedKeyPath] = useState<string>('');
  const { connectToServer } = useSsh();

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
      await connectToServer(serverDetails)
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

  const handleSelectKeyFile = async () => {
    try {
      const result = await DocumentPicker.pickSingle({
        presentationStyle: 'pageSheet',
      });

      if (result && result.name && result.uri) {
        setSelectedKeyPath(result.name);
        const fileContent = await FileSystem.readAsStringAsync(result.uri);
        setServerDetails({ ...serverDetails, key: fileContent });
      }
    } catch (error) {
      console.error('Error selecting file:', error);
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
            <View width="90%">
              <RadioGroup
                value={authMethod}
                onValueChange={(val) => setAuthMethod(val as AuthMethod)}
                name="auth-method"
              >
                <YStack space="$2">
                  <XStack space="$2" alignItems="center">
                    <RadioGroup.Item value="password" id="password">
                      <RadioGroup.Indicator />
                    </RadioGroup.Item>
                    <Text>Password</Text>
                  </XStack>

                  <XStack space="$2" alignItems="center">
                    <RadioGroup.Item value="keyFile" id="keyFile">
                      <RadioGroup.Indicator />
                    </RadioGroup.Item>
                    <Text>Key File</Text>
                  </XStack>

                  <XStack space="$2" alignItems="center">
                    <RadioGroup.Item value="pasteKey" id="pasteKey">
                      <RadioGroup.Indicator />
                    </RadioGroup.Item>
                    <Text>Paste Key</Text>
                  </XStack>
                </YStack>
              </RadioGroup>
            </View>

            {authMethod === 'password' && (
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
                    key: '',
                  })
                }
              />
            )}

            {authMethod === 'keyFile' && (
              <YStack width="90%" space="$2">
                <XStack alignItems="center" space="$2">
                  <Button onPress={handleSelectKeyFile} flex={1}>
                    Select Key File
                  </Button>
                  <Text flex={2} numberOfLines={1} ellipsizeMode="middle">
                    {selectedKeyPath || 'No file selected'}
                  </Text>
                </XStack>

                <LabeledInput
                  label="Key Passphrase (optional)"
                  autoCapitalize="none"
                  size="$4"
                  secureTextEntry={true}
                  value={serverDetails.password}
                  onChange={(e) =>
                    setServerDetails({
                      ...serverDetails,
                      password: e.nativeEvent.text,
                    })
                  }
                />
              </YStack>
            )}

            {authMethod === 'pasteKey' && (
              <YStack width="90%" space="$2">
                <TextArea
                  placeholder="Paste private key (-----BEGIN RSA...)"
                  size="$4"
                  height={100}
                  value={serverDetails.key}
                  onChange={(e) =>
                    setServerDetails({
                      ...serverDetails,
                      key: e.nativeEvent.text,
                      password: '',
                    })
                  }
                />

                <LabeledInput
                  label="Key Passphrase (optional)"
                  autoCapitalize="none"
                  size="$4"
                  secureTextEntry={true}
                  value={serverDetails.password}
                  onChange={(e) =>
                    setServerDetails({
                      ...serverDetails,
                      password: e.nativeEvent.text,
                    })
                  }
                />
              </YStack>
            )}
          </View>
          <XStack
            alignItems="center"
            justifyContent="flex-end"
            gap="$2"
            paddingRight="10%"
          >
            {!!testResult && (
              <View>
                <Text
                  style={{ color: testResult == 'Success' ? 'green' : 'red' }}
                  textAlign="center"
                >
                  {testResult}
                </Text>
              </View>
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
