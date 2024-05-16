import { Upload } from '@tamagui/lucide-icons';
import { Button } from 'tamagui';
import React from 'react';
import { useFiles } from '../../contexts/files';
import { useSsh } from '../../contexts/ssh';
import DocumentPicker from 'react-native-document-picker';
import TransparentButton from '../transparent-button';

export default function UploadButton() {
  const { sshClient } = useSsh();
  const { currentFolder } = useFiles();

  const handlePress = () => {
    if (!sshClient || !currentFolder) return;
    const upload = async () => {
      const file = await DocumentPicker.pickSingle({
        presentationStyle: 'pageSheet',
      });
      if (!file?.uri) return;
      const uploadFile = decodeURI(file.uri.replace('file://', ''));
      console.log(`Upload from: ${uploadFile} to ${currentFolder.filePath}`);
      await sshClient.sftpUpload(
        uploadFile,
        currentFolder.filePath,
        (error, response) => {
          if (error) {
            console.warn('Upload failed:', error);
          } else {
            console.log('Upload successful: ', response);
          }
        },
      );
    };
    upload();
  };

  return (
    <TransparentButton key={'upload'} onPress={handlePress}>
      <Upload color={'white'} />
    </TransparentButton>
  );
}
