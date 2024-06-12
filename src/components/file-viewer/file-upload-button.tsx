// import { Upload } from '@tamagui/lucide-icons';
// import React from 'react';
// import { useFiles } from '../../contexts/files';
// import { useSsh } from '../../contexts/ssh';
// import DocumentPicker from 'react-native-document-picker';
// import uuid from 'react-native-uuid';
// import TransparentButton from '../general/transparent-button';

// export default function UploadButton() {
//   const { sshClient } = useSsh();
//   const { currentFolder } = useFiles();

//   const handlePress = () => {
//     if (!sshClient || !currentFolder) return;
//     const upload = async () => {
//       const file = await DocumentPicker.pickSingle({
//         presentationStyle: 'pageSheet',
//       });
//       if (!file?.uri) return;
//       const uploadFile = decodeURI(file.uri.replace('file://', ''));
//       const destinationFile = `${currentFolder.filePath}/${file.name}`;
//       console.log(`Upload from: ${uploadFile} to ${destinationFile}`);
//       const id = uuid.v4() as string;

//       await sshClient.upload(id, uploadFile, destinationFile);
//     };
//     upload();
//   };

//   return (
//     <TransparentButton key={'upload'} onPress={handlePress}>
//       <Upload color={'white'} />
//     </TransparentButton>
//   );
// }
