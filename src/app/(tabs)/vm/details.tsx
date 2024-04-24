import React from 'react';
import { ScrollView, View, Text } from 'tamagui';
import { useVms } from '../../../contexts/vm';
import JsonViewer from '../../../components/json';

export default function JsonScreen() {
  const { currentVmName, vms } = useVms();
  let vm = vms.find((c) => c.domain.name[0] === currentVmName);

  return (
    <View flex={1}>
      <ScrollView>
        <JsonViewer
          data={vm as Record<string, unknown>}
          renderArrayLabel={(label) => (
            <Text style={{ color: 'lightblue' }} selectable>
              {label}
            </Text>
          )}
        />
      </ScrollView>
    </View>
  );
}
