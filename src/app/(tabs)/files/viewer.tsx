import React, { useState, useEffect } from 'react';
import { View, Text } from 'tamagui';
import { useSsh } from '../../../contexts/ssh';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import DocumentPicker from 'react-native-document-picker';
import { FileInfo, findPaths, parseFileInfo } from '../../../util/files';
import { useFiles } from '../../../contexts/files';
import CompressModal from './compress';
import InfoModal from './info';
import Alert from '../../../components/general/alert';
import FileList from '../../../components/file-viewer/file-list';
import RenameModal from '../../../components/file-viewer/rename';
import { useHeader } from '../../../contexts/header';
import TabWrapper from '../../../components/nav/tabs';
import SearchBar from '../../../components/general/search-bar';
import { useFocusedEffect } from '../../../util/focused-effect';
import uuid from 'react-native-uuid';

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

  const [files, setFiles] = useState<FileInfo[]>([]);
  const [fileLoadingComplete, setFileLoadingComplete] =
    useState<boolean>(false);
  // for when search is being used
  const [filteredFiles, setFilteredFiles] = useState<FileInfo[]>([]);
  const [folder, setFolder] = useState<FileInfo | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [compressOpen, setCompressOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [path, setPath] = useState('/');
  const [searchTab, setSearchTab] = useState(
    'This Folder' as 'This Folder' | 'All Subfolders',
  );
  const [renameOpen, setRenameOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchError, setSearchError] = useState('');
  const [tabsEnabled, setTabsEnabled] = useState(false);
  const [downloadError, setDownloadError] = useState(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(false);

  useFocusedEffect(() => {
    const zeroLength = searchInput.length === 0;
    setSearchError('');
    setFilteredFiles([]);
    zeroLength && setSearchTab('This Folder');
    setTabsEnabled(!zeroLength);
    if (zeroLength) return;
    if (searchInput.length < 3) return;

    const abortController = new AbortController();

    // TODO this should only trigger once every 300ms IF the user is done typing
    async function search() {
      if (!sshClient) return;
      try {
        console.log(filteredFiles.length, files.length);
        setFilteredFiles([]);
        setFileLoadingComplete(false);
        let output = '';
        await findPaths(
          sshClient,
          path,
          searchTab === 'All Subfolders',
          (data) => {
            if (abortController.signal.aborted) return;
            output += data;
            const files = output
              .split('\n')
              .map((line) => parseFileInfo(line, searchInput))
              .filter((file) => file && file.filePath !== path)
              .filter(Boolean) as FileInfo[];
            setFilteredFiles(files);
          },
          () => {
            setFileLoadingComplete(true);
            console.log('SET COMPLETE');
          },
          abortController.signal,
          searchInput.toLowerCase(),
        );
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('Search operation aborted');
        } else {
          throw err;
        }
      }
    }

    search();

    return () => {
      abortController.abort();
    };
  }, [searchInput, searchTab]);

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
    async function fetchFiles() {
      if (path !== params.path) return;
      if (!sshClient) return;
      setFiles([]);
      setFileLoadingComplete(false);
      let output = '';
      await findPaths(
        sshClient,
        path,
        false,
        (data) => {
          output += data;
          const files = output
            .split('\n')
            .map((line) => parseFileInfo(line, ''))
            .filter((file) => file && file.filePath !== path)
            .filter(Boolean) as FileInfo[];
          setFiles(files);
        },
        () => setFileLoadingComplete(true),
      );
      setRefreshing(false);
    }
    fetchFiles();
  }, [path, sshClient, triggerRefresh]);

  useFocusedEffect(() => {
    // don't want files reloading when moving between screens
    if (path !== params.path) return;
    if (!sshClient || !files || !cachedFile) return;
    const baseCommand = cachedFile.type === 'copy' ? 'cp -r' : 'mv';

    const paste = async () => {
      const deduped = dedupeFileName(cachedFile.file);
      const command = `${baseCommand} ${cachedFile.file.filePath} ${path}/${deduped}`;
      console.log(`Pasting: ${command}`);
      await sshClient.exec(command);
      setFiles([
        ...files,
        { ...cachedFile.file, filePath: `${path}/${cachedFile.file.fileName}` },
      ]);
      setCachedFile(null);
    };
    paste();
  }, [pasteLocation]);

  function dedupeFileName(item: FileInfo) {
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
    return duplicate;
  }

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
    const targetPath =
      decodeURI(directory.uri.replace('file://', '')) + item.fileName;
    const originatingFile = `${path}/${item.fileName}`;
    console.log(`Downloading from: ${originatingFile} to ${targetPath}`);
    // sshClient.sftpLs(path);
    const downloadId = uuid.v4() as string;
    await sshClient.download(downloadId, originatingFile, targetPath);
    console.log('Download started: ', item.size);
    // set interval to check download progress
    // const interval = setInterval(async () => {
    //   const progress = await sshClient.downloadProgress(downloadId);
    //   console.log('Download progress:', progress);
    //   if (progress >= Number(item.size)) {
    //     clearInterval(interval);
    //   }
    // }, 1000);
  };

  const handleDelete = async (item: FileInfo | null) => {
    if (!sshClient || !item) return;
    const command = `rm -r${item.fileType === 'd' ? 'f' : ''} ${item.filePath}`;
    setFiles(files?.filter((file) => file.filePath !== item.filePath) || []);
    await sshClient.exec(command);
  };

  // Add this function to handle the renaming process
  const handleRename = async (item: FileInfo | null, newName: string) => {
    if (!sshClient || !item || !newName) return;
    const command = `mv ${item.filePath} ${path}/${newName}`;
    await sshClient.exec(command);
    setFiles(
      files?.map((file) =>
        file.filePath === item.filePath
          ? { ...file, fileName: newName, filePath: `${path}/${newName}` }
          : file,
      ) || [],
    );
    setRenameOpen(false);
  };

  // TODO toast these console.log errors
  const handleDuplicate = async (item: FileInfo) => {
    if (!sshClient || !files) return;
    let duplicate = dedupeFileName(item);
    const command = `cp -r ${path}/${item.fileName} ${path}/${duplicate}`;
    await sshClient.exec(command);
    setFiles([
      ...(files || []),
      { ...item, fileName: duplicate, filePath: `${path}/${duplicate}` },
    ]);
  };

  const handleSearch = (text: string) => {
    setSearchInput(text);
  };

  const handleTabChange = async (tab: string) => {
    if (!sshClient) return;
    setSearchTab(tab as 'This Folder' | 'All Subfolders');
  };

  return (
    <View flexGrow={1}>
      <SearchBar
        visible={path !== '/'}
        searchInput={searchInput}
        handleSearch={handleSearch}
      />
      <TabWrapper
        isEnabled={tabsEnabled}
        onTabChange={handleTabChange}
        tabs={['This Folder', 'All Subfolders']}
      >
        <FileList
          files={tabsEnabled ? filteredFiles : files}
          fileLoadingComplete={fileLoadingComplete}
          folder={folder}
          displayAsPath={tabsEnabled && searchTab === 'All Subfolders'}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            setTriggerRefresh(!triggerRefresh);
          }}
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
        {!!searchError && <Text>{searchError}</Text>}
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
      {!!downloadError && (
        <Alert
          title="Download failed"
          description={`Currently download only works on files less than 5MB, we are working on fixing that!`}
          open={downloadError}
          onOk={() => {
            setDownloadError(false);
          }}
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
