import { ClipboardPaste, FolderOutput } from '@tamagui/lucide-icons';
import { Button } from 'tamagui';
import { useFiles } from '../contexts/files';
import React from 'react';
import { useHeader } from '../contexts/header';
import TransparentButton from './transparent-button';

export function PasteButton() {
  const { cachedFile, currentFolder } = useFiles();
  const { setPasteLocation } = useHeader();
  switch (cachedFile?.type) {
    case 'copy':
      return (
        <TransparentButton
          key={'paste'}
          onPress={() => setPasteLocation(currentFolder)}
        >
          <ClipboardPaste color={'white'} scaleX={-1} />
        </TransparentButton>
      );
    case 'move':
      return (
        <TransparentButton
          key={'paste'}
          onPress={() => setPasteLocation(currentFolder)}
        >
          <FolderOutput color={'white'} />
        </TransparentButton>
      );
    default:
      return <></>;
  }
}
