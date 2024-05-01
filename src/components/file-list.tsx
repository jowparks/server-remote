import React from 'react';
import { YGroup, Separator, ListItem } from 'tamagui';
import { ChevronRight } from '@tamagui/lucide-icons';

import ContextMenuView from 'react-native-context-menu-view';
import { FileInfo } from '../util/files/util';

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
  files: FileInfo[];
  folder: FileInfo | null;
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

const FileList: React.FC<FileListProps> = ({
  files,
  folder,
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
}) => (
  <YGroup
    alignSelf="center"
    bordered
    width="90%"
    size="$5"
    separator={<Separator />}
  >
    {files?.map((item, index) => (
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
            title={item.fileName}
            onPress={() => onPress(item)}
            iconAfter={item.fileType === 'd' ? ChevronRight : undefined}
            style={{
              borderTopLeftRadius: index === 0 ? 10 : 0,
              borderTopRightRadius: index === 0 ? 10 : 0,
              borderBottomLeftRadius: index === files.length - 1 ? 10 : 0,
              borderBottomRightRadius: index === files.length - 1 ? 10 : 0,
            }}
          />
        </ContextMenuView>
      </YGroup.Item>
    ))}
  </YGroup>
);

export default FileList;
