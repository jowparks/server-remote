import React, { createContext, useState, useContext, ReactNode } from 'react';
import { VirshVm } from '../typing/virsh';

// Create the context
interface VirshVmContextValue {
  virshVms: VirshVm[];
  setVirshVms: React.Dispatch<React.SetStateAction<VirshVm[]>>;
  currentVmName: string | null;
  setCurrentVmName: React.Dispatch<React.SetStateAction<string | null>>;
}
const VirshVmContext = createContext<VirshVmContextValue>({
  virshVms: [],
  setVirshVms: () => {},
  currentVmName: null,
  setCurrentVmName: () => {},
});

// Create the provider component
export function VirshVmProvider({ children }: { children: ReactNode }) {
  const [virshVms, setVirshVms] = useState<VirshVm[]>([]);
  const [currentVmName, setCurrentVmName] = useState<string | null>(null);

  return (
    <VirshVmContext.Provider
      value={{
        virshVms,
        setVirshVms,
        currentVmName,
        setCurrentVmName,
      }}
    >
      {children}
    </VirshVmContext.Provider>
  );
}

// Create a custom hook to use the VirshVm context
export function useVirshVms() {
  const context = useContext(VirshVmContext);
  if (context === undefined) {
    throw new Error('useVirshVms must be used within a VirshVmProvider');
  }
  return context;
}
