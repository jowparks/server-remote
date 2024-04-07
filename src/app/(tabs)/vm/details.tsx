import React from 'react';
import { ScrollView, View } from 'tamagui';
import JsonTree from '../../../components/json-tree';
import { useVirshVms } from '../../../contexts/virtual-machines';

export default function JsonScreen() {
  const { currentVmName, virshVms } = useVirshVms();
  let vm = virshVms.find((c) => c.domain.name[0] === currentVmName);

  return (
    <View flex={1} alignItems="center">
      <ScrollView>
        <JsonTree data={vm as Record<string, unknown>} />
      </ScrollView>
    </View>
  );
}
