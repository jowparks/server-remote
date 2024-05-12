import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FileInfo } from '../util/files/util';

interface HeaderContextProps {
  pasteLocation: FileInfo | null;
  setPasteLocation: React.Dispatch<React.SetStateAction<FileInfo | null>>;
  detailsExpanded: boolean;
  setDetailsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  featureRequested: boolean;
  setFeatureRequested: React.Dispatch<React.SetStateAction<boolean>>;
}

const HeaderContext = createContext<HeaderContextProps | undefined>(undefined);

export const useHeader = () => {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error('useHeader must be used within a HeaderProvider');
  }
  return context;
};

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [pasteLocation, setPasteLocation] = useState<FileInfo | null>(null);
  const [detailsExpanded, setDetailsExpanded] = useState<boolean>(false);
  const [featureRequested, setFeatureRequested] = useState<boolean>(false);

  return (
    <HeaderContext.Provider
      value={{
        pasteLocation,
        setPasteLocation,
        detailsExpanded,
        setDetailsExpanded,
        featureRequested,
        setFeatureRequested,
      }}
    >
      {children}
    </HeaderContext.Provider>
  );
}
