import { View } from 'tamagui';
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { GenericScreenType } from '../../../components/generic/types';
import GenericSearchList from '../../../components/generic/search-list';
import MenuScreen from '../../../components/generic/menu';
import { getObjectAtPath } from '../../../util/json';

export default function Generic() {
  return (
    <View flex={1} alignItems="center">
      <GenericScreen />
    </View>
  );
}

function GenericScreen() {
  const params = useLocalSearchParams();
  const jsonDataObj = JSON.parse(
    params.jsonData as string,
  ) as GenericScreenType;
  const currentPath = params.currentPath as string;

  // check if root key is in top level json

  const currentObj = getObjectAtPath(jsonDataObj, currentPath);
  const type = (currentObj as GenericScreenType).type;
  switch (type) {
    case 'searchList':
      console.log('Search List determined...');
      return <GenericSearchList {...currentObj} jsonData={jsonDataObj} />;
    case 'menu':
      console.log('Menu determined...');
      return <MenuScreen {...currentObj} jsonData={jsonDataObj} />;
    default:
      const exhaustiveCheck: never = type;
      throw new Error(`Unhandled type: ${exhaustiveCheck}`);
  }
}
