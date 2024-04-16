import React, { createContext, useState, useContext, ReactNode } from 'react';
import { VirshVm } from '../typing/virsh';

// Create the context
interface VmContextValue {
  vms: VirshVm[];
  setVms: React.Dispatch<React.SetStateAction<VirshVm[]>>;
  currentVmName: string | null;
  setCurrentVmName: React.Dispatch<React.SetStateAction<string | null>>;
}
const VmContext = createContext<VmContextValue>({
  vms: [],
  setVms: () => {},
  currentVmName: null,
  setCurrentVmName: () => {},
});

// Create the provider component
export function VmProvider({ children }: { children: ReactNode }) {
  const [vms, setVms] = useState<VirshVm[]>([]);
  const [currentVmName, setCurrentVmName] = useState<string | null>(null);

  return (
    <VmContext.Provider
      value={{
        vms,
        setVms,
        currentVmName,
        setCurrentVmName,
      }}
    >
      {children}
    </VmContext.Provider>
  );
}

// Create a custom hook to use the VirshVm context
export function useVms() {
  const context = useContext(VmContext);
  if (context === undefined) {
    throw new Error('useVms must be used within a VmProvider');
  }
  return context;
}
