import React from 'react';
import { Button, Nav, XStack } from 'tamagui';
import { BookmarkButton } from './bookmark-button';
import { PasteButton } from './paste-button';
import UploadButton from './file-upload-button';
import { CircleEllipsis, Expand } from '@tamagui/lucide-icons';
import ContextMenuView from 'react-native-context-menu-view';
import TransparentButton from './transparent-button';

enum NavOptions {
  Paste = 'Paste',
  Upload = 'Upload',
  Bookmark = 'Bookmark',
}

export default function FileViewerNav() {
  return (
    <ContextMenuView
      actions={[
        { title: NavOptions.Paste, systemIcon: 'info.circle' },
        { title: NavOptions.Upload, systemIcon: 'info.circle' },
        { title: NavOptions.Bookmark, systemIcon: 'info.circle' },
      ]}
      dropdownMenuMode={true}
      onPress={(event) => {
        switch (event.nativeEvent.name as NavOptions) {
          case NavOptions.Bookmark:
            console.log('Bookmark');
            break;
          case NavOptions.Paste:
            console.log('Paste');
            break;
          case NavOptions.Upload:
            console.log('Upload');
            break;
          default:
            break;
        }
      }}
      previewBackgroundColor="transparent"
    >
      <TransparentButton>
        <CircleEllipsis />
      </TransparentButton>
    </ContextMenuView>
  );
  return (
    <XStack gap="$2">
      <PasteButton />
      <UploadButton />
      <BookmarkButton />
    </XStack>
  );
}
