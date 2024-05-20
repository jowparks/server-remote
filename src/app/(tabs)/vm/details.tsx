import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Spacer } from 'tamagui';
import { useVms } from '../../../contexts/vm';
import JsonViewer from '../../../components/containers/json';
import { RefreshControl } from 'react-native';

export default function JsonScreen() {
  const { currentVmName, vms, retrieveVms } = useVms();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(false);
  let vm = vms.find((c) => c.domain.name[0] === currentVmName);

  useEffect(() => {
    (async () => {
      await retrieveVms();
      setRefreshing(false);
    })();
  }, [triggerRefresh]);

  if (!vm) {
    return (
      <>
        <Spacer size="$2" />
        <Text alignSelf="center">VM not found</Text>
      </>
    );
  }

  return (
    <View flex={1}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              setTriggerRefresh(!triggerRefresh);
            }}
          />
        }
      >
        <JsonViewer
          data={vm['domain'] as Record<string, unknown>}
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
