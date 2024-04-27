import { Bookmark, BookmarkCheck } from '@tamagui/lucide-icons';
import React, { useEffect, useState } from 'react';
import { Button } from 'tamagui';
import { useFiles } from '../contexts/files';

export function BookmarkButton() {
  const { selectedFile } = useFiles();
  const { bookmarkedFiles } = useFiles();

  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (selectedFile) {
      setChecked(
        !!bookmarkedFiles.find(
          (file) => selectedFile.filePath === file.filePath,
        ),
      );
    }
  }, [selectedFile, bookmarkedFiles]);

  const Icon = checked ? BookmarkCheck : Bookmark;
  const { addBookmarkedFile, removeBookmarkedFile } = useFiles();
  return (
    <Button
      unstyled
      onPress={() => {
        if (!selectedFile) return;
        if (!checked) {
          addBookmarkedFile(selectedFile);
          setChecked(true);
        } else {
          removeBookmarkedFile(selectedFile);
          setChecked(false);
        }
      }}
    >
      <Icon color={'white'} />
    </Button>
  );
}
