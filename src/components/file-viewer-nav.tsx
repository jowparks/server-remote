import React from 'react';
import { XStack } from 'tamagui';
import { BookmarkButton } from './bookmark-button';
import { PasteButton } from './paste-button';

export default function FileViewerNav() {
  return (
    <XStack>
      <PasteButton />
      <BookmarkButton />
    </XStack>
  );
}
