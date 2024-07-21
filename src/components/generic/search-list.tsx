import React, { useEffect, useState } from 'react';
import { View, Spacer, ScrollView, YGroup, Separator } from 'tamagui';
import Spin from '../general/spinner';
import { RefreshControl } from 'react-native';
import { useFocusedEffect } from '../../util/focused-effect';
import { useSsh } from '../../contexts/ssh';
import { SearchListScreenType, SearchReplace } from './types';
import GenericListCard from './card';
import SearchBar from '../general/search-bar';
import { useRouter } from 'expo-router';
import {
  replaceTemplateStringWithJsonPath,
  updateObjectAtPath,
} from '../../util/json';

export default function GenericScrollCard(props: SearchListScreenType) {
  const {
    searchCommand,
    idField,
    nameField,
    subHeadingField,
    jsonData,
    currentPath,
    onCardPress,
  } = props;
  const { sshClient } = useSsh();
  const router = useRouter();

  const [localJsonData, setLocalJsonData] = useState({});
  const [listItems, setListItems] = useState([]);
  const [loaded, setLoaded] = useState(true);
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchResponse, setSearchResponse] = useState<any>([]);
  const [searchError, setSearchError] = useState<string>('');

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(false);

  useEffect(() => {
    setLocalJsonData(jsonData);
  }, []);

  useFocusedEffect(() => {
    const zeroLength = searchInput.length === 0;
    setSearchError('');
    if (zeroLength) return;
    if (searchInput.length < 3) return;

    const fetchList = async () => {
      console.log('fetching generic search list...');
      setLoaded(false);
      console.log('setloaded');
      if (!sshClient) return;
      console.log('sshClient`');
      const command = searchCommand.replace(SearchReplace, searchInput);
      console.log('command', command);
      const response = await sshClient.exec(command as string);
      // TODO update jsonData at correct path location for responses, use localJsonData
      setSearchResponse(response);
      setLocalJsonData(
        updateObjectAtPath(
          localJsonData,
          currentPath ? currentPath + '.searchResponse' : 'searchResponse',
          response,
        ),
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
                  onCardPress={async () => {
                    // TODO THIS IS THE NEXT THING TO HANDLE, update remote config with object instead of string
                    if (onCardPress instanceof Object) {
                      router.push({
                        pathname: '(tabs)/search/generic',
                        params: {
                          jsonData: JSON.stringify({
                            ...localJsonData,
                            currentPath: currentPath
                              ? currentPath + '.' + 'onCardPress'
                              : 'onCardPress',
                          }),
                        },
                      });
                    } else {
                      const commandStr = replaceTemplateStringWithJsonPath(
                        onCardPress,
                        item,
                      );
                      const output = await sshClient?.exec(commandStr);
                      console.log(output);
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
