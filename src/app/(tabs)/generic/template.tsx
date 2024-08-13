import { View, Text } from 'tamagui';
import React, { useState } from 'react';
import { GenericScreenType } from '../../../components/generic/types';
import GenericSearchList from '../../../components/generic/search-list';
import MenuScreen from '../../../components/generic/menu';
import { getObjectAtPath } from '../../../util/json';
import GenericScrollCard from '../../../components/generic/scroll-card';
import Spin from '../../../components/general/spinner';
import { useGenericScreen } from '../../../contexts/generic';
import { useFocusedEffect } from '../../../util/focused-effect';
import { useLocalSearchParams, useNavigation } from 'expo-router';

export default function Template() {
  return (
    <View flex={1} alignItems="center">
      <TemplateScreen />
    </View>
  );
}

function TemplateScreen() {
  const params = useLocalSearchParams();
  const navigation = useNavigation();

  const { config, currentTab } = useGenericScreen();
  const [localJsonData, setLocalJsonData] = useState<GenericScreenType | null>(
    null,
  );
  const [currentObj, setCurrentObj] = useState<GenericScreenType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusedEffect(() => {
    console.log('useFocusedEffect template');
    if (!params) return;
    if (!config || !config.tabs) return;
    console.log('currentTabTemplate', currentTab);
    const data = config.tabs[currentTab];
    navigation.setOptions({ title: data.name });
    console.log('data', data);
    if (data) {
      setLocalJsonData(data);
      const currentObj = getObjectAtPath(data, data.currentPath ?? '');
      setCurrentObj(currentObj);
      setIsLoading(false);
      return;
    } else {
      setError(
        `Could not load JSON for tab "${params.tabName}" from remote server`,
      );
    }
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
