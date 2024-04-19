import React, { ReactNode, createContext, useContext, useState } from 'react';
import { FileInfo } from '../util/files/util';

interface FileContextProps {
  files: FileInfo[] | null;
  setFiles: React.Dispatch<React.SetStateAction<FileInfo[] | null>>;
  currentFile: FileInfo | null;
  setCurrentFile: React.Dispatch<React.SetStateAction<FileInfo | null>>;
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
  const [files, setFiles] = useState<FileInfo[] | null>(null);
  const [currentFile, setCurrentFile] = useState<FileInfo | null>(null);

  return (
    <FileContext.Provider
      value={{ files, setFiles, currentFile, setCurrentFile }}
    >
      {children}
    </FileContext.Provider>
  );
}
