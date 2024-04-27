import React from 'react';
import { XStack } from 'tamagui';
import { BookmarkButton } from './bookmark-button';
import ExitButton from './exit-button';
import { PasteButton } from './paste-button';

export default function FileViewerNav() {
  return (
    <XStack>
      <PasteButton />
      <BookmarkButton />
      <ExitButton />
    </XStack>
  );
}
