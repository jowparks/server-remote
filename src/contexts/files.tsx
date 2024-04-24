import React, { ReactNode, createContext, useContext, useState } from 'react';
import { FileInfo } from '../util/files/util';

export interface CachedFile {
  file: FileInfo;
  type: 'copy' | 'move';
}

interface FileContextProps {
  selectedFile: FileInfo | null;
  setSelectedFile: React.Dispatch<React.SetStateAction<FileInfo | null>>;
  cachedFile: CachedFile | null;
  setCachedFile: React.Dispatch<React.SetStateAction<CachedFile | null>>;
}

const FileContext = createContext<FileContextProps | undefined>(undefined);

export const useFiles = () => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error('useFile must be used within a FileProvider');
  }
  return context;
};

export function FilesProvider({ children }: { children: ReactNode }) {
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const [cachedFile, setCachedFile] = useState<CachedFile | null>(null);

  return (
    <FileContext.Provider
      value={{
        selectedFile,
        setSelectedFile,
        cachedFile,
        setCachedFile,
      }}
    >
      {children}
    </FileContext.Provider>
  );
}
