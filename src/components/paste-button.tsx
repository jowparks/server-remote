import { ClipboardPaste, FolderOutput } from '@tamagui/lucide-icons';
import { Button } from 'tamagui';
import { useFiles } from '../contexts/files';
import React from 'react';

export function PasteButton() {
  const { cachedFile, currentFolder, setPasteLocation } = useFiles();
  switch (cachedFile?.type) {
    case 'copy':
      return (
        <Button
          key={'paste'}
          unstyled
          onPress={() => setPasteLocation(currentFolder)}
        >
          <ClipboardPaste color={'white'} scaleX={-1} />
        </Button>
      );
    case 'move':
      return (
        <Button
          key={'paste'}
          unstyled
          onPress={() => setPasteLocation(currentFolder)}
        >
          <FolderOutput color={'white'} />
        </Button>
      );
    default:
      return <></>;
  }
}
