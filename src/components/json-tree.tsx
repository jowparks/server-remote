import React from 'react';
import JSONTree, { JSONTreeProps } from 'react-native-json-tree';
import { View } from 'tamagui';

export default function JsonTree(props: JSONTreeProps) {
  // TODO Refreshing is causing reordering in the json tree
  // TODO handle styling
  // TODO handle text not wrapping
  // TODO add copy button
  return (
    <View style={{ maxWidth: 500 }}>
      <JSONTree {...props} hideRoot={true} shouldExpandNode={() => true} />
    </View>
  );
}
