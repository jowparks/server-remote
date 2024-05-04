import React, {
  ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';
import { FileInfo } from '../util/files/util';
import { storage } from '../storage/mmkv';

export interface CachedFile {
  file: FileInfo;
  type: 'copy' | 'move';
}

interface FileContextProps {
  selectedFile: FileInfo | null;
  setSelectedFile: React.Dispatch<React.SetStateAction<FileInfo | null>>;
  currentFolder: FileInfo | null;
  setCurrentFolder: React.Dispatch<React.SetStateAction<FileInfo | null>>;
  cachedFile: CachedFile | null;
  setCachedFile: React.Dispatch<React.SetStateAction<CachedFile | null>>;
  recentFiles: FileInfo[];
  bookmarkedFiles: FileInfo[];
  addRecentFile: (file: FileInfo) => void;
  removeRecentFile: (file: FileInfo) => void;
  addBookmarkedFile: (file: FileInfo) => void;
  removeBookmarkedFile: (file: FileInfo) => void;
  hostname: string;
  setHostName: (hostname: string) => void;
}

const FileContext = createContext<FileContextProps | undefined>(undefined);

export const useFiles = () => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error('useFiles must be used within a FilesProvider');
  }
  return context;
};

export function FilesProvider({ children }: { children: ReactNode }) {
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const [currentFolder, setCurrentFolder] = useState<FileInfo | null>(null);
  const [cachedFile, setCachedFile] = useState<CachedFile | null>(null);
  const [recentFiles, setRecentFiles] = useState<FileInfo[]>([]);
  const [bookmarkedFiles, setBookmarkedFiles] = useState<FileInfo[]>([]);
  const [hostname, setHostName] = useState<string>('');
  const bookmarkedFileStore = `${hostname}_recentFiles_file_arr`;
  const recentFileStore = `${hostname}_bookmarkedFiles_file_arr`;

  useEffect(() => {
    const loadedRecentFiles = storage.get<FileInfo[]>(bookmarkedFileStore);
    const loadedBookmarkedFiles = storage.get<FileInfo[]>(bookmarkedFileStore);

    if (loadedRecentFiles) {
      setRecentFiles(loadedRecentFiles);
    }

    if (loadedBookmarkedFiles) {
      setBookmarkedFiles(loadedBookmarkedFiles);
    }
  }, [hostname]);

  const addRecentFile = (file: FileInfo) => {
    const newRecentFiles = [file, ...recentFiles];
    setRecentFiles(newRecentFiles);
    storage.setObject(recentFileStore, newRecentFiles);
  };

  const addBookmarkedFile = (file: FileInfo) => {
    const newBookmarkedFiles = [file, ...bookmarkedFiles];
    setBookmarkedFiles(newBookmarkedFiles);
    storage.setObject(bookmarkedFileStore, newBookmarkedFiles);
  };

  const removeBookmarkedFile = (file: FileInfo) => {
    const newBookmarkedFiles = bookmarkedFiles.filter(
      (f) => f.filePath !== file.filePath,
    );
    setBookmarkedFiles(newBookmarkedFiles);
    storage.setObject(bookmarkedFileStore, newBookmarkedFiles);
  };

  const removeRecentFile = (file: FileInfo) => {
    const newRecentFiles = recentFiles.filter(
      (f) => f.filePath !== file.filePath,
    );
    setRecentFiles(newRecentFiles);
    storage.setObject(recentFileStore, newRecentFiles);
  };

  return (
    <FileContext.Provider
      value={{
        selectedFile,
        setSelectedFile,
        currentFolder,
        setCurrentFolder,
        cachedFile,
        setCachedFile,
        recentFiles,
        bookmarkedFiles,
        addRecentFile,
        addBookmarkedFile,
        removeBookmarkedFile,
        removeRecentFile,
        hostname,
        setHostName,
      }}
    >
      {children}
    </FileContext.Provider>
  );
}
