import React, { useEffect, useState } from 'react';
import { MoreHorizontal } from '@tamagui/lucide-icons';
import ContextMenuView, {
  ContextMenuAction,
  ContextMenuOnPressNativeEvent,
} from 'react-native-context-menu-view';
import TransparentButton from './transparent-button';
import { useHeader } from '../contexts/header';
import { useFiles } from '../contexts/files';
import { useSsh } from '../contexts/ssh';
import DocumentPicker from 'react-native-document-picker';
import { NativeSyntheticEvent } from 'react-native';

enum NavOptions {
  Paste = 'Paste',
  Upload = 'Upload',
  Bookmark = 'Bookmark',
  Unbookmark = 'Unbookmark',
}

export default function FileViewerNav() {
  const { setPasteLocation } = useHeader();
  const {
    currentFolder,
    cachedFile,
    bookmarkedFiles,
    addBookmarkedFile,
    removeBookmarkedFile,
  } = useFiles();
  const { sshClient } = useSsh();

  const [bookmarked, setBoomarked] = useState(false);
  const [actions, setActions] = useState<ContextMenuAction[]>([]);

  useEffect(() => {
    if (currentFolder) {
      setBoomarked(
        !!bookmarkedFiles.find(
          (file) => currentFolder.filePath === file.filePath,
        ),
      );
    }
  }, [currentFolder, bookmarkedFiles]);

  useEffect(() => {
    const upload = {
      title: NavOptions.Upload,
      systemIcon: 'square.and.arrow.up',
    };
    const bookmark = bookmarked
      ? {
          title: NavOptions.Unbookmark,
          systemIcon: 'bookmark',
        }
      : { title: NavOptions.Bookmark, systemIcon: 'bookmark.fill' };
    const paste = {
      title: NavOptions.Paste,
      systemIcon: 'doc.on.clipboard.fill',
      disabled: !cachedFile,
    };
    setActions([upload, bookmark, paste]);
  }, [bookmarked, cachedFile]);

  function handleUpload() {
    if (!sshClient || !currentFolder) return;
    const upload = async () => {
      const file = await DocumentPicker.pickSingle({
        presentationStyle: 'pageSheet',
      });
      if (!file?.uri) return;
      const uploadFile = decodeURI(file.uri.replace('file://', ''));
      console.log(`Upload from: ${uploadFile} to ${currentFolder.filePath}`);
      await sshClient.sftpUpload(
        uploadFile,
        currentFolder.filePath,
        (error, response) => {
          if (error) {
            console.warn('Upload failed:', error);
          } else {
            console.log('Upload successful: ', response);
          }
        },
      );
    };
    upload();
  }

  function handleBookmark() {
    if (!currentFolder) return;
    addBookmarkedFile(currentFolder);
    setBoomarked(true);
  }
  function handleUnbookmark() {
    if (!currentFolder) return;
    removeBookmarkedFile(currentFolder);
    setBoomarked(false);
  }

  function handleContextMenuEvent(
    event: NativeSyntheticEvent<ContextMenuOnPressNativeEvent>,
  ) {
    switch (event.nativeEvent.name as NavOptions) {
      case NavOptions.Bookmark:
        handleBookmark();
        break;
      case NavOptions.Unbookmark:
        handleUnbookmark();
        break;
      case NavOptions.Paste:
        setPasteLocation(currentFolder);
        break;
      case NavOptions.Upload:
        handleUpload();
        break;
      default:
        break;
    }
  }

  return (
    <ContextMenuView
      actions={actions}
      dropdownMenuMode={true}
      onPress={handleContextMenuEvent}
      previewBackgroundColor="transparent"
    >
      <TransparentButton>
        <MoreHorizontal />
      </TransparentButton>
    </ContextMenuView>
  );
}
