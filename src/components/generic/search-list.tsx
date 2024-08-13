import React, { useEffect, useState } from 'react';
import { View, Spacer, ScrollView, YGroup, Separator } from 'tamagui';
import Spin from '../general/spinner';
import { RefreshControl } from 'react-native';
import { useFocusedEffect } from '../../util/focused-effect';
import { useSsh } from '../../contexts/ssh';
import {
  CommandType,
  GenericScreenType,
  ScreenMetadata,
  Screens,
  SearchListScreenType,
  SearchReplace,
} from './types';
import GenericListCard from './card';
import SearchBar from '../general/search-bar';
import { useRouter } from 'expo-router';
import { template, updateObjectAtPath } from '../../util/json';
import { useGenericScreen } from '../../contexts/generic';

type Screen = SearchListScreenType & ScreenMetadata;
export default function GenericScrollCard(props: SearchListScreenType) {
  const { searchCommand, jsonData, currentPath, onCardPress } = props;
  const { sshClient } = useSsh();
  const { currentTab, setCurrentTab, setTab } = useGenericScreen();
  const router = useRouter();

  const [localJsonData, setLocalJsonData] = useState<Screen>(
    jsonData as Screen,
  );
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
      setLoaded(false);
      if (!sshClient) return;
      const encodedSearchInput = encodeURIComponent(searchInput);
      const command = searchCommand.replace(SearchReplace, encodedSearchInput);
      const response = await sshClient.exec(command as string);
      // TODO update jsonData at correct path location for responses, use localJsonData
      setSearchResponse(response);
      setLocalJsonData(
        updateObjectAtPath(
          jsonData,
          currentPath ? currentPath + '.searchResponse' : 'searchResponse',
          response,
        ) as Screen,
      );
      const listItems = JSON.parse(response);
      setListItems(listItems);
      setLoaded(true);
      setRefreshing(false);
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
                  name={template(localJsonData.card.nameField, item)}
                  subHeading={template(
                    localJsonData.card.subHeadingField,
                    item,
                  )}
                  contentWidth="100%"
                  onCardPress={async () => {
                    if (Screens.includes(onCardPress['type'] as string)) {
                      console.log(
                        'New screen to navigate to: ',
                        onCardPress['type'],
                      );
                      let data: any = {
                        ...localJsonData,
                        currentPath: currentPath
                          ? currentPath + '.' + 'onCardPress'
                          : 'onCardPress',
                      };
                      console.log(data.currentPath + '.eventData');
                      data = updateObjectAtPath(
                        data,
                        data.currentPath + '.eventData',
                        item,
                      );
                      console.log('jsonData prepush', data);
                      setTab(currentTab, data);
                      setCurrentTab(currentTab);
                      router.push({
                        pathname: `(tabs)/generic/template`,
                      });
                    } else if (onCardPress['type'] === 'command') {
                      const commandStr = template(
                        (onCardPress as CommandType).command,
                        item,
                      );
                      const output = await sshClient?.exec(commandStr);
                      setCurrentTab(currentTab);
                      setTab(
                        currentTab,
                        updateObjectAtPath(
                          localJsonData,
                          currentPath
                            ? currentPath + '.onCardPressResponse'
                            : 'onCardPressResponse',
                          output,
                        ) as SearchListScreenType & ScreenMetadata,
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
