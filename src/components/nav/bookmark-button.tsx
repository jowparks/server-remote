import { Bookmark, BookmarkCheck } from '@tamagui/lucide-icons';
import React, { useEffect, useState } from 'react';
import { useFiles } from '../../contexts/files';
import TransparentButton from '../general/transparent-button';

export function BookmarkButton() {
  const { currentFolder } = useFiles();
  const { bookmarkedFiles } = useFiles();

  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (currentFolder) {
      setChecked(
        !!bookmarkedFiles.find(
          (file) => currentFolder.filePath === file.filePath,
        ),
      );
    }
  }, [currentFolder, bookmarkedFiles]);

  const Icon = checked ? BookmarkCheck : Bookmark;
  const { addBookmarkedFile, removeBookmarkedFile } = useFiles();
  return (
    <TransparentButton
      onPress={() => {
        if (!currentFolder) return;
        if (!checked) {
          addBookmarkedFile(currentFolder);
          setChecked(true);
        } else {
          removeBookmarkedFile(currentFolder);
          setChecked(false);
        }
      }}
    >
      <Icon color={'white'} />
    </TransparentButton>
  );
}
