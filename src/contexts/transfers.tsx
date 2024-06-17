import React, { createContext, useState, useContext } from 'react';
import { useSsh } from './ssh';

// Define the shape of the context

type Transfer = {
  id: string;
  filename: string;
  sourcePath: string;
  destPath: string;
  totalBytes: number;
  transferredBytes: number;
};

interface TransferContextType {
  transfers: Transfer[];
  addTransfer: (props: Transfer) => void;
  removeTransfer: (id: string) => void;
}

// Create the context
export const TransferContext = createContext<TransferContextType | undefined>(
  undefined,
);

type TransferProviderProps = {
  children: React.ReactNode;
};

// Create the provider component
export const TransferProvider: React.FC<TransferProviderProps> = ({
  children,
}) => {
  const { sshClient } = useSsh();
  const [transfers, setTransfers] = useState<Transfer[]>([]);

  const addTransfer = (transfer: Transfer) => {
    console.log('adding transfer', transfer);
    setTransfers((prevTransfers) => [...prevTransfers, transfer]);
    if (!sshClient) return;

    const interval = setInterval(async () => {
      const transferredBytes = await sshClient.transferProgress(transfer.id); // replace with your actual function
      setTransfers((prevTransfers) =>
        prevTransfers.map((t) =>
          t.filename === transfer.filename ? { ...t, transferredBytes } : t,
        ),
      );
      console.log(transferredBytes, transfer.totalBytes);
      if (transferredBytes >= transfer.totalBytes) {
        clearInterval(interval);
      }
    }, 100);
  };

  const removeTransfer = (id: string) => {
    setTransfers((prevTransfers) =>
      prevTransfers.filter((transfer) => transfer.id !== id),
    );
  };

  return (
    <TransferContext.Provider
      value={{ transfers, addTransfer, removeTransfer }}
    >
      {children}
    </TransferContext.Provider>
  );
};

export const useTransfers = () => {
  const context = useContext(TransferContext);
  if (context === undefined) {
    throw new Error('useTransfers must be used within a TransferProvider');
  }
  return context;
};
