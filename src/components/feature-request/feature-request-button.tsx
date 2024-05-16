import { Plus } from '@tamagui/lucide-icons';
import React from 'react';
import { useHeader } from '../../contexts/header';
import TransparentButton from '../general/transparent-button';

export function FeatureRequestButton() {
  const { setFeatureRequested } = useHeader();
  return (
    <TransparentButton key={'paste'} onPress={() => setFeatureRequested(true)}>
      <Plus color={'white'} />
    </TransparentButton>
  );
}
