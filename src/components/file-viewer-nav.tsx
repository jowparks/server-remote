import React from 'react';
import { XStack } from 'tamagui';
import { BookmarkButton } from './bookmark-button';
import { PasteButton } from './paste-button';
import UploadButton from './file-upload-button';

export default function FileViewerNav() {
  return (
    <XStack gap="$2">
      <PasteButton />
      <UploadButton />
      <BookmarkButton />
    </XStack>
  );
}
