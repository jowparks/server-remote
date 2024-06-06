import React, { createContext, useState, useContext, ReactNode } from 'react';
import { VirshVm } from '../typing/virsh';
import { useSsh } from './ssh';
import { parseVirshDumpXML } from '../util/vm';

// Create the context
interface VmContextValue {
  vms: VirshVm[];
  retrieveVms: () => Promise<void>;
  currentVmName: string | null;
  setCurrentVmName: React.Dispatch<React.SetStateAction<string | null>>;
}
const VmContext = createContext<VmContextValue>({
  vms: [],
  retrieveVms: () => Promise.resolve(),
  currentVmName: null,
  setCurrentVmName: () => {},
});

// Create the provider component
export function VmProvider({ children }: { children: ReactNode }) {
  const [vms, setVms] = useState<VirshVm[]>([]);
  const { sshClient } = useSsh();
  const [currentVmName, setCurrentVmName] = useState<string | null>(null);

  const retrieveVms = async () => {
    if (!sshClient) return;
    const response = await sshClient.exec('virsh list --all --name');
    const names = response?.split('\n').filter(Boolean);
    if (!names) return;
    const vmXMLStrings = await Promise.all(
      names.map((name) => {
        return sshClient.exec(`virsh dumpxml "${name}"`);
      }),
    );
    const vmXMLs = await Promise.all(
      vmXMLStrings.map((xml) => {
        return parseVirshDumpXML(xml);
      }),
    );
    const states = await Promise.all(
      names.map(async (name) => {
        const state = await sshClient.exec(`virsh domstate "${name}"`);
        return {
          name: name,
          state: state.trim(),
        };
      }),
    );
    const vms: VirshVm[] = vmXMLs.filter(Boolean).map((vm) => {
      const stateObj = states.find((state) => state.name === vm.domain.name[0]);
      return { ...vm, state: stateObj?.state || '' };
    });
    setVms(vms);
  };

  return (
    <VmContext.Provider
      value={{
        vms,
        retrieveVms,
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
