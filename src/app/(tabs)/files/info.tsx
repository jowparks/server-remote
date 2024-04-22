import React, { useEffect } from 'react';
import { ListItem, Separator, View, YGroup, Text } from 'tamagui';
import { useFiles } from '../../../contexts/files';
import { fileInfoKeyMap } from '../../../util/files/util';
import { useNavigation } from 'expo-router';

export default function InfoScreen() {
  const { currentFile } = useFiles();
  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({ title: currentFile?.fileName });
  }, [currentFile, navigation]);
  if (!currentFile) return null;
  return (
    <View flex={1} alignItems="center">
      <YGroup
        alignSelf="center"
        bordered
        width={'90%'}
        size="$5"
        separator={<Separator />}
      >
        {Object.keys(currentFile).map((key) => (
          <YGroup.Item key={key}>
            <ListItem
              elevate
              size="$4"
              bordered
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text>{fileInfoKeyMap[key]}</Text>
              <Text>{currentFile[key]}</Text>
            </ListItem>
          </YGroup.Item>
        ))}
      </YGroup>
    </View>
  );
}
