import React, { useState, useEffect } from 'react';
import { ScrollView, View, Spinner } from 'tamagui';
import { useSsh } from '../../../contexts/ssh';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import DocumentPicker from 'react-native-document-picker';
import { FileInfo, sftpPaths } from '../../../util/files/util';
import { CachedFile, useFiles } from '../../../contexts/files';
import CompressModal from './compress';
import InfoModal from './info';
import Alert from '../../../components/alert';
import FileList from '../../../components/file-list';
import RenameModal from '../../../components/rename';

const FolderViewer = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const navigation = useNavigation();
  const { sshClient } = useSsh();
  const {
    selectedFile,
    cachedFile,
    pasteLocation,
    setSelectedFile,
    setCachedFile,
    setCurrentFolder,
    addRecentFile,
  } = useFiles();

  const [files, setFiles] = useState<FileInfo[] | null>(null);
  const [folder, setFolder] = useState<FileInfo | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [compressOpen, setCompressOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [path, setPath] = useState('/');
  const [loading, setLoading] = useState(true);
  const [renameOpen, setRenameOpen] = useState(false);

  useEffect(() => {
    const initialPath = Array.isArray(params.path)
      ? params.path[0]
      : params.path;
    const path = initialPath || '/';

    setPath(path);
    setFolder(selectedFile);
    setCurrentFolder(selectedFile);
    navigation.setOptions({ title: path });
  }, [navigation]);

  useEffect(() => {
    // don't want files reloading when moving between screens
    if (path !== params.path) return;
    setLoading(true);
    const fetchFileInfo = async () => {
      setLoading(true);
      if (!sshClient) return;
      const files = await sftpPaths(sshClient, path);
      setFiles(files);
      setLoading(false);
    };

    fetchFileInfo();
  }, [path]);

  useEffect(() => {
    // don't want files reloading when moving between screens
    if (path !== params.path) return;
    if (!sshClient || !files || !cachedFile) return;
    const baseCommand = cachedFile.type === 'copy' ? 'cp -r' : 'mv';

    const copy = async () => {
      const command = `${baseCommand} ${cachedFile.file.filePath} ${path}`;
      console.log(`Pasting: ${command}`);
      // TODO: finalize paste
      await sshClient.execute('ls', (error) => {
        if (error) {
          console.warn('Pasting failed:', error);
        } else {
          console.log('Pasting successful');
        }
      });
      setFiles([
        ...files,
        { ...cachedFile.file, filePath: `${path}/${cachedFile.file.fileName}` },
      ]);
      setCachedFile(null);
    };
    copy();
  }, [pasteLocation]);

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

  const handleDownload = async (item: FileInfo) => {
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

  // Add this function to handle the renaming process
  const handleRename = async (item: FileInfo | null, newName: string) => {
    if (!sshClient || !item || !newName) return;
    const command = `mv ${item.filePath} ${path}/${newName}`;
    console.log(`Renaming: ${command}`);
    // TODO: finalize rename
    await sshClient.execute('ls', (error) => {
      if (error) {
        console.warn('Rename failed:', error);
      } else {
        console.log('Rename successful');
      }
    });
    setFiles(
      files?.map((file) =>
        file.filePath === item.filePath
          ? { ...file, fileName: newName, filePath: `${path}/${newName}` }
          : file,
      ) || [],
    );
    setRenameOpen(false);
  };

  const handleDuplicate = async (item: FileInfo) => {
    if (!sshClient || !files) return;
    let i = 1;
    const fileNameParts = item.fileName.split('.');
    const baseName = fileNameParts.slice(0, -1).join('.');
    const extension =
      fileNameParts.length > 1
        ? '.' + fileNameParts[fileNameParts.length - 1]
        : '';
    let duplicate = `${baseName}${i}${extension}`;

    while (files.some((file) => file.fileName === duplicate)) {
      i++;
      duplicate = `${baseName}${i}${extension}`;
    }
    const command = `cp -r ${path}/${item.fileName} ${path}/${duplicate}`;
    console.log(`Duplicating: ${command}`);
    // TODO: finalize duplicate
    await sshClient.execute('ls', (error) => {
      if (error) {
        console.warn('Duplicate failed:', error);
      } else {
        console.log('Duplicate successful');
      }
    });
    setFiles([
      ...(files || []),
      { ...item, fileName: duplicate, filePath: `${path}/${duplicate}` },
    ]);
  };

  return loading || !files ? (
    <Spinner />
  ) : (
    <View flexGrow={1}>
      <ScrollView>
        <FileList
          files={files}
          folder={folder}
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
            setRenameOpen(true);
          }}
          onDuplicate={handleDuplicate}
          onDeleteOpen={(item) => {
            setSelectedFile(item);
            setDeleteOpen(true);
          }}
          onDownload={handleDownload}
          onCopy={(item) => setCachedFile({ file: item, type: 'copy' })}
          onMove={(item) => setCachedFile({ file: item, type: 'move' })}
          onContext={(item) => addRecentFile(item)}
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
      {!!renameOpen && (
        <RenameModal
          open={renameOpen}
          originalName={selectedFile?.fileName || ''}
          onOpenChange={(state) => setRenameOpen(state)}
          onConfirm={(name) => {
            handleRename(selectedFile, name);
            setRenameOpen(false);
          }}
          onCancel={() => setRenameOpen(false)}
        />
      )}
    </View>
  );
};

export default FolderViewer;
