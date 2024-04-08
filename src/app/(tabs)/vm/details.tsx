import React from 'react';
import { ScrollView, View } from 'tamagui';
import { useVirshVms } from '../../../contexts/virtual-machines';
import JsonViewer from '../../../components/json';

export default function JsonScreen() {
  const { currentVmName, virshVms } = useVirshVms();
  let vm = virshVms.find((c) => c.domain.name[0] === currentVmName);

  return (
    <View flex={1} alignItems="center">
      <ScrollView>
        <JsonViewer data={vm as Record<string, unknown>} />
      </ScrollView>
    </View>
  );
}
