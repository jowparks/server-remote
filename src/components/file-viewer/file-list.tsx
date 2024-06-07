import React, { useEffect, useRef, useState } from 'react';
import { YGroup, Separator, ListItem, Text } from 'tamagui';
import { FlatList, RefreshControl } from 'react-native';
import { ChevronRight } from '@tamagui/lucide-icons';

import ContextMenuView from 'react-native-context-menu-view';
import { FileInfo } from '../../util/files';
import Spin from '../general/spinner';

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

interface FileListProps {
  files: FileInfo[] | null;
  fileLoadingComplete: boolean;
  folder: FileInfo | null;
  displayAsPath: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  setSelectedFile: (item: FileInfo) => void;
  onPress: (item: FileInfo) => void;
  onInfo: (item: FileInfo) => void;
  onCompress: (item: FileInfo) => void;
  onRename: (item: FileInfo) => void;
  onDuplicate: (item: FileInfo) => void;
  onDeleteOpen: (item: FileInfo) => void;
  onDownload: (item: FileInfo) => void;
  onCopy: (item: FileInfo) => void;
  onMove: (item: FileInfo) => void;
  onContext: (item: FileInfo) => void;
}

export default function FileList({
  files,
  fileLoadingComplete,
  folder,
  displayAsPath,
  refreshing,
  onRefresh,
  onPress,
  setSelectedFile,
  onInfo,
  onCompress,
  onRename,
  onDuplicate,
  onDeleteOpen,
  onDownload,
  onCopy,
  onMove,
  onContext,
}: FileListProps) {
  const pressTimer = useRef(0);
  const pressOutTimer = useRef(0);
  const [debouncedFiles, setDebouncedFiles] = useState(files || []);

  useEffect(() => {
    // Set debouncedFiles to files after a delay
    const timerId = setTimeout(() => {
      setDebouncedFiles(files || []);
    }, 100); // Adjust delay as needed

    // Clear timeout if files changes before delay is over
    return () => {
      clearTimeout(timerId);
    };
  }, [files]);

  const renderItem = ({ item, index }) => (
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
        setSelectedFile(item);
        folder && onContext(folder);
        switch (event.nativeEvent.name as FileContext) {
          case FileContext.GetInfo:
            onInfo(item);
            break;
          case FileContext.Download:
            onDownload(item);
            break;
          case FileContext.Copy:
            onCopy(item);
            break;
          case FileContext.Move:
            onMove(item);
            break;
          case FileContext.Rename:
            onRename(item);
            break;
          case FileContext.Duplicate:
            onDuplicate(item);
            break;
          case FileContext.Compress:
            onCompress(item);
            break;
          case FileContext.Delete:
            onDeleteOpen(item);
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
        bordered={true}
        title={renderSearchPath(item, displayAsPath, 15)}
        // prevent trigger of context at same time
        onPress={() => {
          console.log(item);
          if (pressOutTimer.current - pressTimer.current < 500) {
            onPress(item);
          }
        }}
        onPressIn={() => {
          pressTimer.current = Date.now();
        }}
        onPressOut={() => {
          pressOutTimer.current = Date.now();
        }}
        iconAfter={item.fileType === 'd' ? ChevronRight : undefined}
        style={{
          borderTopLeftRadius: index === 0 ? 10 : 0,
          borderTopRightRadius: index === 0 ? 10 : 0,
          borderBottomLeftRadius: index === debouncedFiles.length - 1 ? 10 : 0,
          borderBottomRightRadius: index === debouncedFiles.length - 1 ? 10 : 0,
        }}
      />
    </ContextMenuView>
  );

  if (!files || files?.length === 0) {
    if (fileLoadingComplete) {
      return <Text alignSelf="center">No Files found</Text>;
    }
    return <Spin />;
  }

  return (
    <FlatList
      data={debouncedFiles}
      renderItem={renderItem}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      keyExtractor={(item) => item.filePath}
      style={{ width: '100%' }}
    />
  );
}

function renderSearchPath(
  file: FileInfo,
  displayAsPath: boolean,
  maxChar = 10,
) {
  const fullPath = displayAsPath ? file.filePath : file.fileName;
  if (!file.searchString) return fullPath;
  const index = fullPath.toLowerCase().indexOf(file.searchString.toLowerCase());
  const start = Math.max(0, index - maxChar);
  const end = Math.min(
    fullPath.length,
    index + file.searchString.length + maxChar,
  );
  const prefix = start > 0 ? '...' : '';
  const suffix = end < fullPath.length ? '...' : '';
  return `${prefix}${fullPath.substring(start, end)}${suffix}`;
}
