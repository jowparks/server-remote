import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, Text } from 'tamagui';
import { debounce } from 'lodash';
import { useSsh } from '../../../contexts/ssh';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import DocumentPicker from 'react-native-document-picker';
import { FileInfo, findPaths } from '../../../util/files';
import { useFiles } from '../../../contexts/files';
import CompressModal from './compress';
import InfoModal from './info';
import Alert from '../../../components/general/alert';
import FileList from '../../../components/file-viewer/file-list';
import RenameModal from '../../../components/file-viewer/rename';
import { useHeader } from '../../../contexts/header';
import TabWrapper from '../../../components/nav/tabs';
import SearchBar from '../../../components/general/search-bar';
import { RefreshControl } from 'react-native';

const FolderViewer = () => {
  const searchTimeLimit = 7000;

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
  const [allFiles, setAllFiles] = useState<FileInfo[]>([]);
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
  const [loading, setLoading] = useState(true);
  const [renameOpen, setRenameOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchError, setSearchError] = useState('');
  const [tabsEnabled, setTabsEnabled] = useState(false);
  const [downloadError, setDownloadError] = useState(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(false);

  useEffect(() => {
    let tab = searchTab;
    const zeroLength = searchInput.length === 0;
    setSearchError('');
    zeroLength && setSearchTab('This Folder');
    setTabsEnabled(!zeroLength);

    let localFiles = tab === 'This Folder' ? files : allFiles;
    const filtered = localFiles
      .filter((file) =>
        file.fileName.toLowerCase().includes(searchInput.toLowerCase()),
      )
      .map((file) => ({ ...file, searchString: searchInput }));
    debouncedSetFilteredFiles.cancel();
    debouncedSetFilteredFiles(filtered);
  }, [searchInput, files, allFiles, searchTab]);

  const debouncedSetFilteredFiles = useCallback(
    debounce((filteredFiles) => {
      setFilteredFiles(filteredFiles);
    }, 300),
    [],
  );

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
    if (!sshClient) return;
    fetchFileInfo(sshClient, false).then((files) => {
      setFiles(files);
      setRefreshing(false);
    });
  }, [path, sshClient, triggerRefresh]);

  useEffect(() => {
    // don't want files reloading when moving between screens
    if (path !== params.path) return;
    if (!sshClient || !files || !cachedFile) return;
    const baseCommand = cachedFile.type === 'copy' ? 'cp -r' : 'mv';

    const copy = async () => {
      const deduped = dedupeFileName(cachedFile.file);
      const command = `${baseCommand} ${cachedFile.file.filePath} ${path}/${deduped}`;
      console.log(`Pasting: ${command}`);
      await sshClient.execute(command, (error) => {
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

  const fetchFileInfo = async (sshClient: unknown, findAll: boolean) => {
    const files = await findPaths(sshClient, path, findAll);
    return files;
  };

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
    const targetPath = decodeURI(directory.uri.replace('file://', ''));
    const originatingFile = `${path}/${item.fileName}`;
    console.log(`Downloading from: ${originatingFile} to ${targetPath}`);
    sshClient.sftpLs(path);
    try {
      await sshClient.sftpDownload(
        originatingFile,
        targetPath,
        (error, response) => {
          if (error) {
            throw error;
          } else {
            console.log('Download successful: ', response);
          }
        },
      );
    } catch (error) {
      setDownloadError(true);
    }
  };

  const handleDelete = async (item: FileInfo | null) => {
    if (!sshClient || !item) return;
    const command = `rm -r${item.fileType === 'd' ? 'f' : ''} ${item.filePath}`;
    setFiles(files?.filter((file) => file.filePath !== item.filePath) || []);
    await sshClient.execute(command, (error) => {
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
    await sshClient.execute(command, (error) => {
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

  // TODO toast these console.log errors
  const handleDuplicate = async (item: FileInfo) => {
    if (!sshClient || !files) return;
    let duplicate = dedupeFileName(item);
    const command = `cp -r ${path}/${item.fileName} ${path}/${duplicate}`;
    await sshClient.execute(command, (error) => {
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

  const handleTabChange = async (tab: string) => {
    if (!sshClient) return;
    setSearchTab(tab as 'This Folder' | 'All Subfolders');
    if (allFiles.length === 0 && tab === 'All Subfolders') {
      setFilteredFiles([]);
      try {
        const files = (await Promise.race([
          fetchFileInfo(sshClient, true),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error('Request timed out')),
              searchTimeLimit,
            ),
          ),
        ])) as FileInfo[];
        setAllFiles(files);
      } catch (error) {
        setAllFiles([]);
        setSearchError(
          'Search timed out, too many files to search through, limit your directory',
        );
      }
    }
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
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                setTriggerRefresh(!triggerRefresh);
              }}
            />
          }
        >
          <FileList
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
          {!!searchError && <Text>{searchError}</Text>}
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
