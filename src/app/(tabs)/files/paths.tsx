import React, { useEffect } from 'react';
import {
  ListItem,
  Separator,
  View,
  YGroup,
  Text,
  Spacer,
  ScrollView,
} from 'tamagui';
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
  return (
    <View flex={1} gap="$5" alignItems="center">
      <Spacer size="$0.25" />
      <Text>Recent Paths</Text>
      <ScrollView width="90%">
        <YGroup
          alignSelf="center"
          bordered
          width={'100%'}
          size="$5"
          separator={<Separator />}
        >
          <YGroup.Item>
            {recentFiles.map((file, index) => (
              <ContextMenuView
                key={file.filePath}
                actions={[
                  { title: 'delete', systemIcon: 'trash', destructive: true },
                ]}
                onPress={() => removeRecentFile(file)}
              >
                <ListItem
                  elevate
                  size="$4"
                  bordered
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTopLeftRadius: index === 0 ? 10 : 0,
                    borderTopRightRadius: index === 0 ? 10 : 0,
                    borderBottomLeftRadius:
                      index === recentFiles.length - 1 ||
                      recentFiles.length === 1
                        ? 10
                        : 0,
                    borderBottomRightRadius:
                      index === recentFiles.length - 1 ||
                      recentFiles.length === 1
                        ? 10
                        : 0,
                  }}
                  onPress={() => handlePathClick(file)}
                >
                  <Text>{file.filePath}</Text>
                </ListItem>
              </ContextMenuView>
            ))}
          </YGroup.Item>
        </YGroup>
      </ScrollView>
      <Text>Bookmarked Paths</Text>
      <ScrollView width="90%">
        <YGroup
          alignSelf="center"
          bordered
          width={'100%'}
          size="$5"
          separator={<Separator />}
        >
          <YGroup.Item>
            {bookmarkedFiles.map((file, index) => (
              <ContextMenuView
                key={file.filePath}
                actions={[
                  { title: 'delete', systemIcon: 'trash', destructive: true },
                ]}
                onPress={() => removeBookmarkedFile(file)}
              >
                <ListItem
                  elevate
                  size="$4"
                  bordered
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTopLeftRadius: index === 0 ? 10 : 0,
                    borderTopRightRadius: index === 0 ? 10 : 0,
                    borderBottomLeftRadius:
                      index === bookmarkedFiles.length - 1 ||
                      bookmarkedFiles.length === 1
                        ? 10
                        : 0,
                    borderBottomRightRadius:
                      index === bookmarkedFiles.length - 1 ||
                      bookmarkedFiles.length === 1
                        ? 10
                        : 0,
                  }}
                  onPress={() => handlePathClick(file)}
                >
                  <Text>{file.filePath}</Text>
                </ListItem>
              </ContextMenuView>
            ))}
          </YGroup.Item>
        </YGroup>
      </ScrollView>
    </View>
  );
}
