import { View, Text } from 'tamagui';
import React, { useState } from 'react';
import { GenericScreenType } from '../../../components/generic/types';
import GenericSearchList from '../../../components/generic/search-list';
import MenuScreen from '../../../components/generic/menu';
import { getObjectAtPath } from '../../../util/json';
import GenericScrollCard from '../../../components/generic/scroll-card';
import Spin from '../../../components/general/spinner';
import { useSsh } from '../../../contexts/ssh';
import { useGenericScreen } from '../../../contexts/generic';
import { useFocusedEffect } from '../../../util/focused-effect';

export default function Generic() {
  return (
    <View flex={1} alignItems="center">
      <GenericScreen />
    </View>
  );
}

function GenericScreen() {
  const { sshClient } = useSsh();
  const { jsonData } = useGenericScreen();
  const [localJsonData, setLocalJsonData] = useState<GenericScreenType | null>(
    null,
  );
  const [currentObj, setCurrentObj] = useState<GenericScreenType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusedEffect(() => {
    console.log('useFocusedEffect generic');
    if (jsonData !== null) {
      setLocalJsonData(jsonData);
      const currentObj = getObjectAtPath(jsonData, jsonData.currentPath);
      setCurrentObj(currentObj);
      setIsLoading(false);
      return;
    }
    if (!sshClient) return;
    sshClient
      .exec('cat /etc/serverRemote.json')
      .then((res) => {
        if (!res) {
          setError('Could not load JSON from remote server');
        }
        const data = JSON.parse(res) as GenericScreenType;
        setLocalJsonData(data);
        const currentObj = getObjectAtPath(data, data.currentPath);
        setCurrentObj(currentObj);
      })
      .catch((error) => {
        console.error('Failed to fetch JSON:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading || localJsonData === null || currentObj === null) {
    return <Spin />; // Or any other loading indicator
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }
  const type = currentObj.type;

  switch (type) {
    case 'searchList':
      console.log('Search List determined...');
      return <GenericSearchList {...currentObj} jsonData={localJsonData} />;
    case 'menu':
      console.log('Menu determined...');
      return <MenuScreen {...currentObj} jsonData={localJsonData} />;
    case 'scrollCard':
      console.log('Scroll Card determined...');
      return <GenericScrollCard {...currentObj} jsonData={localJsonData} />;
    default:
      const exhaustiveCheck: never = type;
      throw new Error(`Unhandled type: ${exhaustiveCheck}`);
  }
}
