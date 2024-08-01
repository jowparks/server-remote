import React, { useState } from 'react';
import {
  View,
  ScrollView,
  YGroup,
  Separator,
  Text,
  Button,
  Image,
  useWindowDimensions,
  Spacer,
} from 'tamagui';
import Spin from '../general/spinner';
import { ScrollCardScreenType } from './types';
import { replaceTemplateStringWithJsonPath } from '../../util/json';

export default function GenericScrollCard(props: ScrollCardScreenType) {
  const { jsonData, displayItems } = props;
  const { height: windowHeight } = useWindowDimensions();

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
        // refreshControl={
        //   <RefreshControl
        //     refreshing={refreshing}
        //     onRefresh={() => {
        //       setRefreshing(true);
        //       setTriggerRefresh(!triggerRefresh);
        //     }}
        //   />
        // }
        >
          <YGroup
            alignSelf="center"
            alignItems="center"
            size="$5"
            width="100%"
            separator={<Separator />}
          >
            {displayItems.map((renderable, index) => (
              <YGroup.Item key={index}>
                <Spacer />
                {(() => {
                  switch (renderable.type) {
                    case 'button':
                      return (
                        <Button>
                          <Text>{renderable.text}</Text>
                        </Button>
                      );
                    case 'image':
                      const uri = replaceTemplateStringWithJsonPath(
                        renderable.imageSource,
                        jsonData,
                      );
                      // TODO set screen height divided by 2

                      return (
                        <View width={'100%'} height={windowHeight / 2}>
                          <Image
                            source={{
                              uri,
                              // width,
                              // height,
                            }}
                            width={'100%'}
                            height={'100%'}
                            resizeMode="contain"
                          />
                        </View>
                      );
                    case 'text':
                      return (
                        <Text alignContent="center">
                          {replaceTemplateStringWithJsonPath(
                            renderable.text,
                            jsonData,
                          )}
                        </Text>
                      );
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
