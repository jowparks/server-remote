import React, { useState } from 'react';
import { View, ScrollView, YGroup, Separator, Text } from 'tamagui';
import Spin from '../general/spinner';
import { RefreshControl } from 'react-native';
import { useSsh } from '../../contexts/ssh';
import { ScrollCardScreenType } from './types';
import { useRouter } from 'expo-router';

export default function GenericScrollCard(props: ScrollCardScreenType) {
  const { jsonData, displayItems } = props;

  const [localJsonData, setLocalJsonData] = useState(jsonData);
  const [loaded, setLoaded] = useState(true);

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(false);

  // useFocusedEffect(() => {}, [sshClient, triggerRefresh]);

  return (
    <View flex={1} width={'90%'}>
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
            {displayItems.map((renderable, index) => (
              <YGroup.Item key={index}>
                {(() => {
                  switch (renderable.type) {
                    case 'button':
                      return <Text>Button {renderable.buttonCommand}</Text>;
                    case 'image':
                      return <Text>Image {renderable.imageSource}</Text>;
                    case 'text':
                      return <Text>{renderable.text}</Text>;
                    case 'command':
                      return <Text>Command {renderable.command}</Text>;
                    default:
                      return <></>;
                  }
                })()}
              </YGroup.Item>
            ))}
          </YGroup>
        </ScrollView>
      )}
    </View>
  );
}
