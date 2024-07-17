import { View } from 'tamagui';
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { GenericScreenType } from '../../../components/generic/types';
import GenericSearchList from '../../../components/generic/search-list';
import MenuScreen from '../../../components/generic/menu';

export default function Generic() {
  return (
    <View flex={1} alignItems="center">
      <GenericScreen />
    </View>
  );
}

function GenericScreen() {
  const params = useLocalSearchParams();
  console.log('params', params);
  const obj = JSON.parse(params.jsonData as string) as GenericScreenType;
  // check if root key is in top level json
  const type = obj.type;
  switch (type) {
    case 'searchList':
      console.log('Search List determined...');
      return <GenericSearchList {...obj} />;
    case 'menu':
      console.log('Menu determined...');
      return <MenuScreen {...obj} />;
    default:
      const exhaustiveCheck: never = type;
      throw new Error(`Unhandled type: ${exhaustiveCheck}`);
  }
}
