import React, { useState, useEffect } from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import { View, Text } from 'tamagui';
import { useSshServerConnection } from '../../../contexts/ssh-client';
import { LsResult } from '@jowparks/react-native-ssh-sftp';

const DirectoryBrowser = () => {
  const { sshClient } = useSshServerConnection();
  const [currentPath, setCurrentPath] = useState('/');
  const [contents, setContents] = useState<LsResult[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDirectory = async () => {
      setLoading(true);
      if (!sshClient) return;
      sshClient.sftpLs(currentPath, (error, response) => {
        if (!response) return;
        if (error) {
          console.warn(error);
          return;
        }
        // actually a list of strings as json
        const data = (response as unknown as string[]).map((item) =>
          JSON.parse(item),
        ) as LsResult[];
        setContents(data);
        console.log(data);
      });
      setLoading(false);
    };

    fetchDirectory();
  }, [currentPath]);

  const handleDirectoryPress = (item) => {
    if (item.type === 'directory') {
      setCurrentPath(`${currentPath}${item.name}/`);
    }
  };

  const renderItem = ({ item }: { item: LsResult }) => (
    <TouchableOpacity
      style={{
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
      }}
      onPress={() => handleDirectoryPress(item)}
    >
      <Text>{item.filename}</Text>
    </TouchableOpacity>
  );

  return (
    <></>
    // <View
    //   style={{
    //     flex: 1,
    //   }}
    // >
    //   {loading || !contents ? (
    //     <Text>Loading...</Text>
    //   ) : (
    //     <FlatList
    //       data={contents}
    //       renderItem={renderItem}
    //       keyExtractor={(item) => item?.filename || '0'}
    //     />
    //   )}
    // </View>
  );
};

export default DirectoryBrowser;
