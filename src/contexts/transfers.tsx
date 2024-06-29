import React, {
  createContext,
  useState,
  useContext,
  useRef,
  useEffect,
} from 'react';
import { useSsh } from './ssh';

// Define the shape of the context

type Transfer = {
  id: string;
  filename: string;
  sourcePath: string;
  destPath: string;
  totalBytes: number;
  transferredBytes: number;
  status: 'in-progress' | 'complete' | 'error' | 'cancelled';
};

interface TransferContextType {
  transfers: Transfer[];
  addTransfer: (props: Transfer) => void;
  updateTransfer: (id: string, transfer: Transfer) => void;
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
  const transfersRef = useRef(transfers);

  useEffect(() => {
    transfersRef.current = transfers;
  }, [transfers]);

  const addTransfer = (transfer: Transfer) => {
    setTransfers((prevTransfers) => [...prevTransfers, transfer]);
    if (!sshClient) return;

    const interval = setInterval(async () => {
      let tf = transfersRef.current.find((t) => t.id === transfer.id);
      if (!tf) {
        throw new Error('Transfer not found');
      }
      if (tf.status === 'cancelled') {
        clearInterval(interval);
        return;
      }
      const transferProgress = await sshClient.transferProgress(tf.id);
      setTransfers((prevTransfers) =>
        prevTransfers.map((t) =>
          t.filename === tf.filename
            ? {
                ...t,
                transferredBytes: transferProgress.transferredBytes,
                totalBytes: transferProgress.totalBytes,
              }
            : t,
        ),
      );
      console.log(transferProgress);
      if (transferProgress.transferredBytes >= transferProgress.totalBytes) {
        updateTransfer(tf.id, { ...tf, status: 'complete' });
        clearInterval(interval);
      }
    }, 100);
  };

  const updateTransfer = (id: string, transfer: Transfer) => {
    setTransfers((prevTransfers) =>
      prevTransfers.map((t) => (t.id === id ? transfer : t)),
    );
  };

  const removeTransfer = (id: string) => {
    setTransfers((prevTransfers) =>
      prevTransfers.filter((transfer) => transfer.id !== id),
    );
  };

  return (
    <TransferContext.Provider
      value={{ transfers, addTransfer, removeTransfer, updateTransfer }}
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
