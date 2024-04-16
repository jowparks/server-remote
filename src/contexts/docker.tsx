import React, { createContext, useState, useContext, ReactNode } from 'react';
import { DockerContainer } from '../typing/docker';

// Create the context
interface DockerContextValue {
  containers: DockerContainer[];
  setContainers: React.Dispatch<React.SetStateAction<DockerContainer[]>>;
  currentContainerId: string | null;
  setCurrentContainerId: React.Dispatch<React.SetStateAction<string | null>>;
}
const DockerContext = createContext<DockerContextValue>({
  containers: [],
  setContainers: () => {},
  currentContainerId: null,
  setCurrentContainerId: () => {},
});

// Create the provider component
export function DockerProvider({ children }: { children: ReactNode }) {
  const [containers, setContainers] = useState<DockerContainer[]>([]);
  const [currentContainerId, setCurrentContainerId] = useState<string | null>(
    null,
  );

  return (
    <DockerContext.Provider
      value={{
        containers,
        setContainers,
        currentContainerId,
        setCurrentContainerId,
      }}
    >
      {children}
    </DockerContext.Provider>
  );
}

// Create a custom hook to use the DockerContainer context
export function useDocker() {
  const context = useContext(DockerContext);
  if (context === undefined) {
    throw new Error(
      'useDockerContainer must be used within a DockerContainerProvider',
    );
  }
  return context;
}
