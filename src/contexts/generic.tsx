import React, { createContext, useContext, useState } from 'react';
import { GenericScreenType } from '../components/generic/types';

// Create a new context
const GenericScreenContext = createContext<{
  jsonData: GenericScreenType | null;
  setJsonData: (screen: GenericScreenType) => void;
}>({
  jsonData: null,
  setJsonData: () => {},
});

export const useGenericScreen = () => useContext(GenericScreenContext);

export const GenericScreenProvider = ({ children }) => {
  const [jsonData, setJsonData] = useState<GenericScreenType | null>(null);

  return (
    <GenericScreenContext.Provider
      value={{
        jsonData,
        setJsonData,
      }}
    >
      {children}
    </GenericScreenContext.Provider>
  );
};
