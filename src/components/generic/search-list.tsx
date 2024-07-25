import React, { useEffect, useState } from 'react';
import { View, Spacer, ScrollView, YGroup, Separator } from 'tamagui';
import Spin from '../general/spinner';
import { RefreshControl } from 'react-native';
import { useFocusedEffect } from '../../util/focused-effect';
import { useSsh } from '../../contexts/ssh';
import {
  CommandType,
  GenericScreenType,
  Screens,
  SearchListScreenType,
  SearchReplace,
} from './types';
import GenericListCard from './card';
import SearchBar from '../general/search-bar';
import { useRouter } from 'expo-router';
import {
  replaceTemplateStringWithJsonPath,
  updateObjectAtPath,
} from '../../util/json';
import { useGenericScreen } from '../../contexts/generic';

export default function GenericScrollCard(props: SearchListScreenType) {
  const {
    searchCommand,
    nameField,
    subHeadingField,
    jsonData,
    currentPath,
    onCardPress,
  } = props;
  const { sshClient } = useSsh();
  const { setJsonData } = useGenericScreen();
  const router = useRouter();

  const [localJsonData, setLocalJsonData] =
    useState<GenericScreenType>(jsonData);
  const [listItems, setListItems] = useState([]);
  const [loaded, setLoaded] = useState(true);
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchResponse, setSearchResponse] = useState<any>([]);
  const [searchError, setSearchError] = useState<string>('');

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(false);

  useFocusedEffect(() => {
    const zeroLength = searchInput.length === 0;
    setSearchError('');
    if (zeroLength) return;
    if (searchInput.length < 3) return;

    const fetchList = async () => {
      console.log('fetching generic search list...');
      setLoaded(false);
      if (!sshClient) return;
      const encodedSearchInput = encodeURIComponent(searchInput);
      const command = searchCommand.replace(SearchReplace, encodedSearchInput);
      console.log('command', command);
      const response = await sshClient.exec(command as string);
      // TODO update jsonData at correct path location for responses, use localJsonData
      setSearchResponse(response);
      setLocalJsonData(
        updateObjectAtPath(
          jsonData,
          currentPath ? currentPath + '.searchResponse' : 'searchResponse',
          response,
        ) as GenericScreenType,
      );
      const listItems = JSON.parse(response);
      setListItems(listItems);
      setLoaded(true);
      setRefreshing(false);
      console.log('fetched generic search list...');
    };
    fetchList();
  }, [sshClient, triggerRefresh]);

  if (searchError) {
    return <View>{searchError}</View>;
  }

  // TODO add search bar, triggerRefresh on debounced search term change
  return (
    <View flex={1} width={'90%'}>
      <SearchBar
        visible={true}
        searchInput={searchInput}
        handleSearch={(text) => {
          setSearchInput(text);
          setTriggerRefresh(!triggerRefresh);
        }}
      />
      <Spacer size="4%" />
      {!loaded ? (
        <Spin />
      ) : (
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
          <YGroup
            alignSelf="center"
            bordered
            size="$5"
            width="100%"
            separator={<Separator />}
          >
            <YGroup.Item>
              {listItems.map((item, index) => (
                <GenericListCard
                  key={index}
                  name={item[nameField as string]}
                  subHeading={item[subHeadingField as string]}
                  contentWidth="100%"
                  onCardPress={async () => {
                    if (Screens.includes(onCardPress['type'] as string)) {
                      console.log(
                        'New screen to navigate to: ',
                        onCardPress['type'],
                      );
                      const data = {
                        ...localJsonData,
                        currentPath: currentPath
                          ? currentPath + '.' + 'onCardPress'
                          : 'onCardPress',
                      };
                      console.log('jsonData prepush', data);
                      setJsonData(data);
                      router.push({
                        pathname: '(tabs)/search/generic',
                      });
                    } else if (onCardPress['type'] === 'command') {
                      const commandStr = replaceTemplateStringWithJsonPath(
                        (onCardPress as CommandType).command,
                        item,
                      );
                      const output = await sshClient?.exec(commandStr);
                      setJsonData(
                        updateObjectAtPath(
                          localJsonData,
                          currentPath
                            ? currentPath + '.onCardPressResponse'
                            : 'onCardPressResponse',
                          output,
                        ) as SearchListScreenType,
                      );
                    }
                  }}
                />
              ))}
            </YGroup.Item>
          </YGroup>
        </ScrollView>
      )}
    </View>
  );
}
