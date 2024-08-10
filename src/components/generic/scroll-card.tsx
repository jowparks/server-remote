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
import { DisplayTypes, ScrollCardScreenType } from './types';
import { template } from '../../util/json';
import { SSHClient, useSsh } from '../../contexts/ssh';

export default function GenericScrollCard(props: ScrollCardScreenType) {
  const { jsonData, displayItems } = props;

  const [loaded, setLoaded] = useState(true);

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { sshClient } = useSsh();

  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(false);
  const { height: windowHeight } = useWindowDimensions();

  // useFocusedEffect(() => {}, [sshClient, triggerRefresh]);

  return (
    <View flex={1} width={'90%'}>
      {!loaded || !sshClient ? (
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
                {render(renderable, jsonData, sshClient, windowHeight)}
              </YGroup.Item>
            ))}
          </YGroup>
        </ScrollView>
      )}
    </View>
  );
}

function render(
  renderable: DisplayTypes,
  jsonData: any,
  sshClient: SSHClient,
  windowHeight: number,
) {
  // const { height: windowHeight } = useWindowDimensions();

  switch (renderable.type) {
    case 'button':
      return (
        <Button
          onPress={() =>
            render(renderable.onPress, jsonData, sshClient, windowHeight)
          }
        >
          <Text>{renderable.text}</Text>
        </Button>
      );
    case 'image':
      const uri = template(renderable.imageSource, jsonData);
      // TODO set screen height divided by 2

      return (
        <View width={'100%'} height={windowHeight / 2}>
          <Image
            source={{ uri }}
            width={'100%'}
            height={'100%'}
            resizeMode="contain"
          />
        </View>
      );
    case 'text':
      return (
        <Text alignContent="center">{template(renderable.text, jsonData)}</Text>
      );
    case 'command':
      // TODO save output from command to commandResponse
      // (async () => {
      //   if (!sshClient) return;
      //   const response = await sshClient.exec(renderable.command);
      // })();
      // return <></>;
      console.log(template(renderable.command, jsonData));
      return;
    default:
      return <></>;
  }
}
