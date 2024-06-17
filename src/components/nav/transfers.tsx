import React, { useState } from 'react';

import { Text } from 'tamagui';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

import { useTransfers } from '../../contexts/transfers';
import TransparentButton from '../general/transparent-button';
import TransferScreen from '../../app/(tabs)/files/transfers';

export function TransfersDisplay() {
  const { transfers } = useTransfers();
  const [modalOpen, setModalOpen] = useState(false);

  const handlePress = () => {
    setModalOpen(true);
  };

  if (transfers.length === 0) {
    return;
  }

  return (
    <>
      <TransparentButton onPress={handlePress} width={40} height={40}>
        <AnimatedCircularProgress
          size={30}
          rotation={0}
          width={3}
          fill={
            (transfers[0]
              ? transfers[0].transferredBytes / transfers[0].totalBytes
              : 0) * 100
          }
          tintColor="#00e0ff"
          backgroundColor="#3d5875"
        >
          {() => <Text>{transfers.length}</Text>}
        </AnimatedCircularProgress>
      </TransparentButton>
      <TransferScreen
        open={modalOpen}
        onOpenChange={() => {
          setModalOpen(false);
        }}
      />
    </>
  );
}
