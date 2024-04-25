import React, { useState, useEffect } from 'react';
import { ScrollView, View, Spinner } from 'tamagui';
import { useSsh } from '../../../contexts/ssh';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import DocumentPicker from 'react-native-document-picker';
import { StyleSheet } from 'react-native';
import { FileInfo, fileCommand, parseFileInfo } from '../../../util/files/util';
import { CachedFile, useFiles } from '../../../contexts/files';
import CompressModal from './compress';
import InfoModal from './info';
import Alert from '../../../components/alert';
import FileList from '../../../components/file-list';
import CacheFileOverlay from '../../../components/cache-file';

const FolderViewer = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const navigation = useNavigation();
  const { sshClient } = useSsh();
  const { selectedFile, setSelectedFile, cachedFile, setCachedFile } =
    useFiles();

  const [files, setFiles] = useState<FileInfo[] | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [compressOpen, setCompressOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [path, setPath] = useState('/');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialPath = Array.isArray(params.path)
      ? params.path[0]
      : params.path;
    const path = initialPath || '/';

    setPath(path);
    navigation.setOptions({ title: path });
  }, [navigation]);

  useEffect(() => {
    setLoading(true);
    // don't want files reloading when moving between screens
    if (path !== params.path) return;
    const fetchFileInfo = async () => {
      setLoading(true);
      if (!sshClient) return;
      console.log(fileCommand(path));
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
  }, [path]);

  const handlePress = (item: FileInfo) => {
    setSelectedFile(item);
    if (item.fileType === 'd') {
      router.push({
        pathname: '(tabs)/files/viewer',
        params: { path: item.filePath },
      });
    } else if (item.fileType === 'f' || item.fileType === 'l') {
      setInfoOpen(true);
    } else {
      console.error('Invalid file type: ', item.fileType);
    }
  };

  const handleDownload = async (item: FileInfo | null) => {
    if (!item) return;
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

  const handleDelete = async (item: FileInfo | null) => {
    if (!sshClient || !item) return;
    const command = `rm -r ${item.filePath}`;
    console.log(`Deleting: ${command}`);
    // TODO: handle delete
    setFiles(files?.filter((file) => file.filePath !== item.filePath) || []);
    await sshClient.execute('ls', (error) => {
      if (error) {
        console.warn('Delete failed:', error);
      } else {
        console.log('Delete successful');
      }
    });
  };

  const handleCachedFile = async () => {
    if (!cachedFile) return;
    if (cachedFile.type === 'copy') {
      handlePaste(cachedFile, path);
    } else if (cachedFile.type === 'move') {
      handleFinalizeMove(cachedFile, path);
    } else {
      console.error('Invalid cached file type');
    }
    setCachedFile(null);
  };

  const handleCopy = async (item: FileInfo | null) => {
    if (!item) return;
    setCachedFile({ file: item, type: 'copy' });
    console.log('Copying:', item);
  };

  const handlePaste = async (cachedFile: CachedFile, path: string) => {
    if (!sshClient) return;
    const command = `cp -r ${cachedFile.file.filePath} ${path}`;
    console.log(`Copying: ${command}`);
    // TODO: finalize paste
    await sshClient.execute('ls', (error) => {
      if (error) {
        console.warn('Copy failed:', error);
      } else {
        console.log('Copy successful');
      }
    });
  };

  const handleMove = async (item: FileInfo | null) => {
    if (!item) return;
    setCachedFile({ file: item, type: 'move' });
    console.log('Moving:', item);
  };

  const handleFinalizeMove = async (cachedFile: CachedFile, path: string) => {
    if (!sshClient) return;
    const command = `mv ${cachedFile.file.filePath} ${path}`;
    console.log(`Moving: ${command}`);
    await sshClient.execute('ls', (error) => {
      if (error) {
        console.warn('Move failed:', error);
      } else {
        console.log('Move successful');
      }
    });
  };

  return loading || !files ? (
    <Spinner />
  ) : (
    <View flexGrow={1}>
      <ScrollView>
        <FileList
          files={files}
          onPress={handlePress}
          setSelectedFile={setSelectedFile}
          onInfo={(item) => {
            setSelectedFile(item);
            setInfoOpen(true);
          }}
          onCompress={(item) => {
            setSelectedFile(item);
            setCompressOpen(true);
          }}
          onRename={(item) => {
            setSelectedFile(item);
          }}
          onDuplicate={(item) => {
            setSelectedFile(item);
          }}
          onDeleteOpen={(item) => {
            setSelectedFile(item);
            setDeleteOpen(true);
          }}
          onDownload={handleDownload}
          onCopy={handleCopy}
          onMove={handleMove}
        />
      </ScrollView>
      {!!compressOpen && (
        <CompressModal
          open={compressOpen}
          onOpenChange={(state) => setCompressOpen(state)}
          file={selectedFile}
        />
      )}
      {!!infoOpen && (
        <InfoModal
          open={infoOpen}
          onOpenChange={(state) => setInfoOpen(state)}
          file={selectedFile}
        />
      )}
      {!!deleteOpen && (
        <Alert
          title="WARNING: This action cannot be undone!"
          description={`Are you sure you want to delete ${selectedFile?.filePath}?`}
          open={deleteOpen}
          onOk={() => {
            handleDelete(selectedFile);
            setDeleteOpen(false);
          }}
          onCancel={() => setDeleteOpen(false)}
        />
      )}
      <CacheFileOverlay open={!!cachedFile} onPress={handleCachedFile} />
    </View>
  );
};
// TODO: CacheFileOverlay is not in right position when folder is not full of files

export default FolderViewer;
