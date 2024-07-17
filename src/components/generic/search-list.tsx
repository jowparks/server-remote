import React, { useState } from 'react';
import { View, Spacer, ScrollView, YGroup, Separator } from 'tamagui';
import Spin from '../general/spinner';
import { RefreshControl } from 'react-native';
import { useFocusedEffect } from '../../util/focused-effect';
import { useSsh } from '../../contexts/ssh';
import { SearchListType } from './types';
import GenericListCard from './card';

export default function GenericSearchList(props: SearchListType) {
  const { searchCommand, id, name, subHeading, onCardPress } = props;
  const { sshClient } = useSsh();
  const [listItems, setListItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('matrix');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(false);
  useFocusedEffect(() => {
    const fetchList = async () => {
      if (!sshClient) return;
      const command = searchCommand.replace('@searchreplace@', searchTerm);
      const listItems = JSON.parse(await sshClient.exec(command as string));
      console.log('listItems', listItems);
      setListItems(listItems);
      setLoaded(true);
      setRefreshing(false);
    };
    fetchList();
  }, [sshClient, triggerRefresh]);

  // TODO add search bar, triggerRefresh on debounced search term change
  return !loaded ? (
    <Spin />
  ) : (
    <View flex={1} width={'90%'}>
      <Spacer size="4%" />
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
                name={item[name as string]}
                subHeading={item[subHeading as string]}
                onCardPress={() => console.log(onCardPress)}
              />
            ))}
          </YGroup.Item>
        </YGroup>
      </ScrollView>
    </View>
  );
}
