import React from 'react';
import { Spinner, View } from 'tamagui';

export default function Spin() {
  return (
    <View flexGrow={1} alignItems="center" justifyContent="center">
      <Spinner size="large" />
    </View>
  );
}
