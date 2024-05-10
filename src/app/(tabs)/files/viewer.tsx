import React, { useState, useEffect } from 'react';
import { ScrollView, View, Spinner, Input, Spacer } from 'tamagui';
import { useSsh } from '../../../contexts/ssh';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import DocumentPicker from 'react-native-document-picker';
import { FileInfo, findPaths } from '../../../util/files/util';
import { useFiles } from '../../../contexts/files';
import CompressModal from './compress';
import InfoModal from './info';
import Alert from '../../../components/alert';
import FileList from '../../../components/file-list';
import RenameModal from '../../../components/rename';
import { useHeader } from '../../../contexts/header';
import TabWrapper from '../../../components/tabs';

const FolderViewer = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const navigation = useNavigation();
  const { sshClient } = useSsh();
  const { pasteLocation } = useHeader();
  const {
    selectedFile,
    cachedFile,
    setSelectedFile,
    setCachedFile,
    setCurrentFolder,
    addRecentFile,
  } = useFiles();

  const [files, setFiles] = useState<FileInfo[] | null>(null);
  // for when search is being used
  const [filteredFiles, setFilteredFiles] = useState<FileInfo[] | null>(null);
  const [folder, setFolder] = useState<FileInfo | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [compressOpen, setCompressOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [path, setPath] = useState('/');
  const [searchTab, setSearchTab] = useState(
    'This Folder' as 'This Folder' | 'All Subfolders',
  );
  const [loading, setLoading] = useState(true);
  const [renameOpen, setRenameOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [tabsEnabled, setTabsEnabled] = useState(false);

  useEffect(() => {
    // TODO might need to setLoading here
    const zeroLength = searchInput.length === 0;
    setTabsEnabled(!zeroLength);
    if (!files) return;
    setFilteredFiles(
      files
        .filter((file) =>
          file.fileName.toLowerCase().includes(searchInput.toLowerCase()),
        )
        .map((file) => ({ ...file, searchString: searchInput })),
    );
  }, [searchInput, files]);

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
    fetchFileInfo(false);
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

  const fetchFileInfo = async (findAll: boolean) => {
    setLoading(true);
    setFiles(null);
    setFilteredFiles(null);
    if (!sshClient) return;
    const files = await findPaths(sshClient, path, findAll);
    setFiles(files);
    setLoading(false);
  };

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

  // TODO: download seems to fail with anything bigger than 5MB, might be an issue with new ssh requests being sent at time of download
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
    const originatingFile = `${path}/${item.fileName}`;
    console.log(`Downloading from: ${originatingFile} to ${targetPath}`);
    await sshClient.sftpDownload(
      originatingFile,
      targetPath,
      (error, response) => {
        if (error) {
          console.warn('Download failed:', error);
        } else {
          console.log('Download successful: ', response);
        }
      },
    );
  };
  // TODO: Sftp uploadZ
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

  const handleSearch = (text: string) => {
    setSearchInput(text);
  };

  const handleTabChange = (tab: string) => {
    console.log(tab);
    setSearchTab(tab as 'This Folder' | 'All Subfolders');
    fetchFileInfo(tab === 'All Subfolders');
  };

  return (
    <View flexGrow={1}>
      <Spacer size="$2" />
      <Input
        width="90%"
        alignSelf="center"
        placeholder="Search"
        value={searchInput}
        onChangeText={handleSearch}
      />
      <Spacer size="$2" />
      <TabWrapper
        isEnabled={tabsEnabled}
        onTabChange={handleTabChange}
        tabs={['This Folder', 'All Subfolders']}
      >
        <ScrollView width="100%">
          <FileList
            loading={loading}
            files={filteredFiles ?? files}
            folder={folder}
            displayAsPath={tabsEnabled && searchTab === 'All Subfolders'}
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
      </TabWrapper>
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
