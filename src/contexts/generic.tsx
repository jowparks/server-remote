import React, { createContext, useContext, useState } from 'react';
import { GenericScreenType, Config } from '../components/generic/types';

// Create a new context
const GenericScreenContext = createContext<{
  config: Config | null;
  currentTab: string;
  setConfig: (config: Config) => void;
  setTab: (name: string, tab: GenericScreenType) => void;
  setCurrentTab: (name: string) => void;
}>({
  config: null,
  currentTab: '',
  setConfig: () => {},
  setTab: () => {},
  setCurrentTab: () => {},
});

export const useGenericScreen = () => useContext(GenericScreenContext);

export const GenericScreenProvider = ({ children }) => {
  const [config, setConfig] = useState<Config | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('');
  // TODO add wrapper here that whenever setJsonData is called, it should template all the fields out
  function setTab(name: string, tab: GenericScreenType) {
    if (config) {
      setConfig({
        ...config,
        tabs: {
          ...config.tabs,
          [name]: tab,
        },
      });
    }
  }
  return (
    <GenericScreenContext.Provider
      value={{
        config,
        currentTab,
        setConfig,
        setTab,
        setCurrentTab,
      }}
    >
      {children}
    </GenericScreenContext.Provider>
  );
};
