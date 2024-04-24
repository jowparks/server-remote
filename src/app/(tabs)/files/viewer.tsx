import React, { useState, useEffect } from 'react';
import { ScrollView, View, Spinner, Button } from 'tamagui';
import { useSsh } from '../../../contexts/ssh';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import DocumentPicker from 'react-native-document-picker';
import { FileInfo, fileCommand, parseFileInfo } from '../../../util/files/util';
import { useFiles } from '../../../contexts/files';
import CompressModal from './compress';
import InfoModal from './info';
import Alert from '../../../components/alert';
import FileList from '../../../components/file-list';

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
  const [trigger, setTrigger] = useState(false);
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
  }, [trigger, path]);

  const handlePress = (item: FileInfo) => {
    setSelectedFile(item);
    if (item.fileType === 'd') {
      router.push({
        pathname: '(tabs)/files/viewer',
        params: { path: item.filePath },
      });
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
    await sshClient.execute('ls', (error) => {
      if (error) {
        console.warn('Delete failed:', error);
      } else {
        console.log('Delete successful');
      }
      setTrigger(!trigger);
    });
  };

  const handleCopy = async (item: FileInfo | null) => {
    if (!item) return;
    setCachedFile({ file: item, type: 'copy' });
    console.log('Copying:', item);
  };

  const handleMove = async (item: FileInfo | null) => {
    if (!item) return;
    setCachedFile({ file: item, type: 'move' });
    console.log('Moving:', item);
  };

  return loading || !files ? (
    <Spinner />
  ) : (
    <View>
      <ScrollView>
        <FileList
          files={files}
          handlePress={handlePress}
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
      {cachedFile && (
        <View
          className="cached-file"
          style={{
            animation: 'move 2s forwards',
            position: 'absolute',
            top: '30%',
            right: '0%',
          }}
        >
          <Button width={50} height={50}>
            F
          </Button>
        </View>
      )}
    </View>
  );
};

export default FolderViewer;
