import React from 'react';
import { XStack } from 'tamagui';
import { BookmarkButton } from './bookmark-button';
import ExitButton from './exit-button';

export default function FileViewerNav() {
  return (
    <XStack>
      <BookmarkButton />
      <ExitButton />
    </XStack>
  );
}
