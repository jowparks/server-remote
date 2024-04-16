import React, { useState, useEffect } from 'react';
import {
  YGroup,
  Separator,
  ListItem,
  ScrollView,
  View,
  Spinner,
} from 'tamagui';
import { useSsh } from '../../../contexts/ssh';
import ContextMenuView from 'react-native-context-menu-view';
import { LsResult } from '@jowparks/react-native-ssh-sftp';
import { ChevronRight } from '@tamagui/lucide-icons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import DocumentPicker from 'react-native-document-picker';

enum FileContext {
  GetInfo = 'Get Info',
  Download = 'Download',
  Copy = 'Copy',
  Move = 'Move',
  Rename = 'Rename',
  Duplicate = 'Duplicate',
  Compress = 'Compress',
  Delete = 'Delete',
}

const DirectoryBrowser = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const navigation = useNavigation();
  const initialPath = Array.isArray(params.path) ? params.path[0] : params.path;
  const path = initialPath || '/';
  const { sshClient } = useSsh();
  const [contents, setContents] = useState<LsResult[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadLocation, setDownloadLocation] = useState<string | null>(null);

  navigation.setOptions({ title: path });

  useEffect(() => {
    const fetchDirectory = async () => {
      setLoading(true);
      if (!sshClient) return;
      sshClient.sftpLs(path, (error, response) => {
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
        setLoading(false);
      });
    };

    fetchDirectory();
  }, []);

  const handlePress = (item: LsResult) => {
    console.log('Pressed:', item);
    if (item.isDirectory) {
      router.push({
        pathname: '(tabs)/files/viewer',
        params: { path: `${path}${item.filename}` },
      });
    }
  };

  const handleDownload = async (item: LsResult) => {
    if (item.isDirectory) {
      console.error('Downloading directory not supported');
      return;
    }
    if (!sshClient) return;
    const directory = await DocumentPicker.pickDirectory({
      presentationStyle: 'pageSheet',
    });
    if (!directory?.uri) return;
    const targetPath = directory.uri.replace('file://', '');
    console.log(`Downloading from: ${path}${item.filename} to ${targetPath}`);
    await sshClient.sftpDownload(
      `${path}${item.filename}`,
      targetPath,
      (error) => {
        if (error) {
          console.warn('Download failed:', error);
        } else {
          console.log('Download successful');
        }
      },
    );
  };

  return loading ? (
    <Spinner />
  ) : (
    <View>
      <ScrollView>
        <YGroup
          alignSelf="center"
          bordered
          width="90%"
          size="$5"
          separator={<Separator />}
        >
          {contents?.map((item) => (
            <YGroup.Item>
              <ContextMenuView
                actions={[
                  { title: FileContext.GetInfo, systemIcon: 'info.circle' },
                  {
                    title: FileContext.Download,
                    systemIcon: 'square.and.arrow.down',
                  },
                  { title: FileContext.Copy, systemIcon: 'doc.on.doc' },
                  { title: FileContext.Move, systemIcon: 'folder' },
                  { title: FileContext.Rename, systemIcon: 'pencil' },
                  {
                    title: FileContext.Duplicate,
                    systemIcon: 'plus.square.on.square',
                  },
                  { title: FileContext.Compress, systemIcon: 'archivebox' },
                  {
                    title: FileContext.Delete,
                    systemIcon: 'trash',
                    destructive: true,
                  },
                ]}
                onPress={(event) => {
                  switch (event.nativeEvent.name) {
                    case FileContext.GetInfo:
                      console.log('Get Info');
                      break;
                    case FileContext.Download:
                      handleDownload(item);
                      break;
                    case FileContext.Copy:
                      console.log('Copy');
                      break;
                    case FileContext.Move:
                      console.log('Move');
                      break;
                    case FileContext.Rename:
                      console.log('Rename');
                      break;
                    case FileContext.Duplicate:
                      console.log('Duplicate');
                      break;
                    case FileContext.Compress:
                      console.log('Compress');
                      break;
                    case FileContext.Delete:
                      console.log('Delete');
                      break;
                    default:
                      break;
                  }
                }}
                previewBackgroundColor="transparent"
              >
                <ListItem
                  hoverTheme
                  pressTheme
                  title={item.filename}
                  onPress={() => handlePress(item)}
                  subTitle="TODO"
                  iconAfter={item.isDirectory ? ChevronRight : undefined}
                />
              </ContextMenuView>
            </YGroup.Item>
          ))}
        </YGroup>
      </ScrollView>
    </View>
  );
};

export default DirectoryBrowser;
