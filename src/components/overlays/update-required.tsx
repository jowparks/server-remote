import React, { useEffect } from 'react';
import Splash from './splash';
import * as Linking from 'expo-linking';
import { useAirtable } from '../../contexts/airtable';
import { Button, Text } from 'tamagui';

export default function UpdateRequired() {
  const { checkUpdateRequired, updateRequired } = useAirtable();
  useEffect(() => {
    checkUpdateRequired();
  }, []);
  if (updateRequired) {
    return (
      <Splash>
        <Button
          onPress={() => Linking.openURL('https://apps.apple.com')}
          alignSelf="center"
          alignItems="center"
          alignContent="center"
        >
          <Text>Please update application to continue using</Text>
        </Button>
      </Splash>
    );
  }
  return <></>;
}
