import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';
import Tabs from '../app/settings/tabs';
import { storage } from '../storage/mmkv';

export type Tabs = 'docker' | 'vm' | 'files';

interface TabsContextProps {
  tabs: Tabs[];
  setTabs: (tabs: Tabs[]) => void;
}

const TabsContext = createContext<TabsContextProps | undefined>(undefined);

export function TabsProvider({ children }: { children: ReactNode }) {
  const [tabs, setTabs] = useState<Tabs[]>(['docker', 'vm', 'files']);
  // store and retrieve tabs from storage
  const tabsStorageKey = 'tabsKey';

  useEffect(() => {
    const checkTabs = async () => {
      const storedTabs = storage.getString(tabsStorageKey);
      if (storedTabs) {
        setTabs(JSON.parse(storedTabs));
      }
    };
    checkTabs();
  }, []);

  const setTabsKey = (tabs: Tabs[]) => {
    storage.set(tabsStorageKey, JSON.stringify(tabs));
    setTabs(tabs);
  };
  return (
    <TabsContext.Provider
      value={{
        tabs,
        setTabs: setTabsKey,
      }}
    >
      {children}
    </TabsContext.Provider>
  );
}

export const useTabs = () => {
  const context = useContext(TabsContext);
  if (context === undefined) {
    throw new Error('useTabs must be used within a TabsProvider');
  }
  return context;
};
