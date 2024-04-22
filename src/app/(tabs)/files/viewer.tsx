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
import { ChevronRight } from '@tamagui/lucide-icons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import DocumentPicker from 'react-native-document-picker';
import { FileInfo, fileCommand, parseFileInfo } from '../../../util/files/util';
import { useFiles } from '../../../contexts/files';

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

const FolderViewer = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const navigation = useNavigation();
  const initialPath = Array.isArray(params.path) ? params.path[0] : params.path;
  const path = initialPath || '/';
  const { sshClient } = useSsh();
  const { files, setFiles, setCurrentFile } = useFiles();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({ title: path });
  }, [path, navigation]);

  useEffect(() => {
    setLoading(true);
    const fetchFileInfo = async () => {
      if (!sshClient) return;
      const response = await sshClient.execute(fileCommand(path));
      const lines = response?.split('\n').filter((line) => line !== '');
      if (!lines) return;
      const files = lines
        .map(parseFileInfo)
        .filter((file) => file.filePath !== path)
        .sort((a, b) => a.filePath.localeCompare(b.filePath));
      setFiles(files);
      setLoading(false);
    };

    fetchFileInfo();
  }, []);

  const handlePress = (item: FileInfo) => {
    setCurrentFile(item);
    if (item.fileType === 'd') {
      router.push({
        pathname: '(tabs)/files/viewer',
        params: { path: `${path}${item.fileName}` },
      });
    }
  };

  const handleDownload = async (item: FileInfo) => {
    if (item.fileType === 'd') {
      console.error('Downloading directory not supported');
      return;
    }
    if (!sshClient) return;
    const directory = await DocumentPicker.pickDirectory({
      presentationStyle: 'pageSheet',
    });
    if (!directory?.uri) return;
    const targetPath = decodeURI(directory.uri.replace('file://', ''));
    console.log(`Downloading from: ${path}${item.fileName} to ${targetPath}`);
    await sshClient.sftpDownload(
      `${path}${item.fileName}`,
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

  function handleInfo() {
    router.push('(tabs)/files/info');
  }

  function handleCompress() {
    router.push('(tabs)/files/compress');
  }

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
          {files?.map((item) => (
            <YGroup.Item key={item.filePath}>
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
                  setCurrentFile(item);
                  switch (event.nativeEvent.name) {
                    case FileContext.GetInfo:
                      handleInfo();
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
                      handleCompress();
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
                  title={item.fileName}
                  onPress={() => handlePress(item)}
                  subTitle="TODO"
                  iconAfter={item.fileType === 'd' ? ChevronRight : undefined}
                />
              </ContextMenuView>
            </YGroup.Item>
          ))}
        </YGroup>
      </ScrollView>
    </View>
  );
};

export default FolderViewer;
