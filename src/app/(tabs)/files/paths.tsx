import React, { useEffect } from 'react';
import { ListItem, Separator, View, YGroup, Text } from 'tamagui';
import { useRouter } from 'expo-router';
import { useFiles } from '../../../contexts/files';
import { FileInfo } from '../../../util/files/util';
import ContextMenuView from 'react-native-context-menu-view';

export default function PathsView() {
  const {
    recentFiles,
    bookmarkedFiles,
    addBookmarkedFile,
    removeBookmarkedFile,
    removeRecentFile,
    setSelectedFile,
  } = useFiles();
  const router = useRouter();
  // TODO: implement search for paths and in viewer
  useEffect(() => {
    if (recentFiles.length === 0) {
      const mockFileInfo: FileInfo = {
        permissions: 'rw-r--r--',
        numHardLinks: 0,
        owner: 'root',
        group: 'group',
        size: '1024',
        lastAccessDate: '2022-01-01T00:00:00Z',
        lastModified: '2022-01-01T00:00:00Z',
        filePath: '/',
        fileName: '/',
        fileType: 'f',
      };
      addBookmarkedFile(mockFileInfo);
    }
  }, []);

  const handlePathClick = (file: FileInfo) => {
    setSelectedFile(file);

    router.push({
      pathname: '(tabs)/files/viewer',
      params: { path: file.filePath },
    });
  };
  // TODO: add scroll view
  return (
    <View flex={1} gap="$5" alignItems="center">
      <Text>Recent Paths</Text>
      <YGroup
        alignSelf="center"
        bordered
        width={'90%'}
        size="$5"
        separator={<Separator />}
      >
        <YGroup.Item>
          {recentFiles.map((file) => (
            <ContextMenuView
              actions={[
                { title: 'delete', systemIcon: 'trash', destructive: true },
              ]}
              onPress={() => removeRecentFile(file)}
            >
              <ListItem
                key={file.filePath}
                elevate
                size="$4"
                bordered
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                onPress={() => handlePathClick(file)}
              >
                <Text>{file.filePath}</Text>
              </ListItem>
            </ContextMenuView>
          ))}
        </YGroup.Item>
      </YGroup>
      <Text>Bookmarked Paths</Text>
      <YGroup
        alignSelf="center"
        bordered
        width={'90%'}
        size="$5"
        separator={<Separator />}
      >
        <YGroup.Item>
          {bookmarkedFiles.map((file) => (
            <ContextMenuView
              actions={[
                { title: 'delete', systemIcon: 'trash', destructive: true },
              ]}
              onPress={() => removeBookmarkedFile(file)}
            >
              <ListItem
                key={file.filePath}
                elevate
                size="$4"
                bordered
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                onPress={() => handlePathClick(file)}
              >
                <Text>{file.filePath}</Text>
              </ListItem>
            </ContextMenuView>
          ))}
        </YGroup.Item>
      </YGroup>
    </View>
  );
}
