import React, { useEffect, useState } from 'react';
import { MoreHorizontal } from '@tamagui/lucide-icons';
import ContextMenuView, {
  ContextMenuAction,
  ContextMenuOnPressNativeEvent,
} from 'react-native-context-menu-view';
import TransparentButton from '../general/transparent-button';
import { useHeader } from '../../contexts/header';
import { useFiles } from '../../contexts/files';
import { useSsh } from '../../contexts/ssh';
import DocumentPicker from 'react-native-document-picker';
import { NativeSyntheticEvent } from 'react-native';
import Alert from '../general/alert';
import uuid from 'react-native-uuid';
import { XStack } from 'tamagui';
import { TransfersDisplay } from './transfers';
import { useTransfers } from '../../contexts/transfers';

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
  const { addTransfer } = useTransfers();

  const [bookmarked, setBoomarked] = useState(false);
  const [actions, setActions] = useState<ContextMenuAction[]>([]);
  const [uploadError, setUploadError] = useState(false);

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
      const sourcePath = decodeURI(file.uri.replace('file://', ''));
      const destinationPath = `${currentFolder.filePath}/${file.name}`;
      console.log(`Upload from: ${sourcePath} to ${destinationPath}`);
      const id = uuid.v4() as string;
      addTransfer({
        id: id,
        filename: file.name || '',
        sourcePath: sourcePath,
        destPath: destinationPath,
        totalBytes: file.size || 0,
        transferredBytes: 0,
        status: 'in-progress',
      });
      await sshClient.transfer(id, sourcePath, destinationPath, 'upload');
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
    <XStack alignItems="center">
      <TransfersDisplay />
      <ContextMenuView
        actions={actions}
        dropdownMenuMode={true}
        onPress={handleContextMenuEvent}
        previewBackgroundColor="transparent"
      >
        <TransparentButton>
          <MoreHorizontal />
        </TransparentButton>
        {!!uploadError && (
          <Alert
            title="Upload failed"
            description={`Currently upload only works on files less than 5MB, we are working on fixing that!`}
            open={uploadError}
            onOk={() => {
              setUploadError(false);
            }}
          />
        )}
      </ContextMenuView>
    </XStack>
  );
}
