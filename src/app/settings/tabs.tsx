import React from 'react';
import { View, Text, XStack, Switch, Spacer } from 'tamagui';
import { useTabs } from '../../contexts/tabs';

export default function Tabs() {
  const { tabs, setTabs } = useTabs();
  return (
    <View
      width={'90%'}
      alignContent="center"
      alignItems="center"
      alignSelf="center"
    >
      <Spacer size={'$4'} />
      <XStack justifyContent="space-between" width={'100%'}>
        <Text>Docker Enabled</Text>
        <View>
          <Switch
            size={'$3'}
            defaultChecked={!!tabs.includes('docker')}
            onCheckedChange={(checked) => {
              if (checked) {
                setTabs([...tabs, 'docker']);
              } else {
                setTabs(tabs.filter((tab) => tab !== 'docker'));
              }
            }}
          >
            <Switch.Thumb size={'$3'} />
          </Switch>
        </View>
      </XStack>
      <XStack justifyContent="space-between" width={'100%'}>
        <Text>VMs Enabled</Text>
        <View>
          <Switch
            size={'$3'}
            defaultChecked={!!tabs.includes('vm')}
            onCheckedChange={(checked) => {
              if (checked) {
                setTabs([...tabs, 'vm']);
              } else {
                setTabs(tabs.filter((tab) => tab !== 'vm'));
              }
            }}
          >
            <Switch.Thumb size={'$3'} />
          </Switch>
        </View>
      </XStack>
      <XStack justifyContent="space-between" width={'100%'}>
        <Text>Files Enabled</Text>
        <View>
          <Switch
            size={'$3'}
            defaultChecked={!!tabs.includes('files')}
            onCheckedChange={(checked) => {
              if (checked) {
                setTabs([...tabs, 'files']);
              } else {
                setTabs(tabs.filter((tab) => tab !== 'files'));
              }
            }}
          >
            <Switch.Thumb size={'$3'} />
          </Switch>
        </View>
      </XStack>
    </View>
  );
}
