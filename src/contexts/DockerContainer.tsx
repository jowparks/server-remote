import React, { createContext, useState, useContext, ReactNode } from 'react';
import { DockerContainer } from '../typing/docker';

// Create the context
interface DockerContainerContextValue {
  dockerContainers: DockerContainer[];
  setDockerContainers: React.Dispatch<React.SetStateAction<DockerContainer[]>>;
  currentContainerId: string | null;
  setCurrentContainerId: React.Dispatch<React.SetStateAction<string | null>>;
}
const DockerContainerContext = createContext<DockerContainerContextValue>({
  dockerContainers: [],
  setDockerContainers: () => {},
  currentContainerId: null,
  setCurrentContainerId: () => {},
});

// Create the provider component
export function DockerContainerProvider({ children }: { children: ReactNode }) {
  const [dockerContainers, setDockerContainers] = useState<DockerContainer[]>(
    [],
  );
  const [currentContainerId, setCurrentContainerId] = useState<string | null>(
    null,
  );

  return (
    <DockerContainerContext.Provider
      value={{
        dockerContainers,
        setDockerContainers,
        currentContainerId,
        setCurrentContainerId,
      }}
    >
      {children}
    </DockerContainerContext.Provider>
  );
}

// Create a custom hook to use the DockerContainer context
export function useDockerContainers() {
  const context = useContext(DockerContainerContext);
  if (context === undefined) {
    throw new Error(
      'useDockerContainer must be used within a DockerContainerProvider',
    );
  }
  return context;
}
