import { ListCollapse, ListTree } from '@tamagui/lucide-icons';
import { Button } from 'tamagui';
import React from 'react';
import { useHeader } from '../contexts/header';
import TransparentButton from './transparent-button';

export default function DetailsExpandButton() {
  const { detailsExpanded, setDetailsExpanded } = useHeader();

  const handlePress = () => setDetailsExpanded(!detailsExpanded);
  const Icon = detailsExpanded ? ListCollapse : ListTree;

  return (
    <TransparentButton key={'paste'} onPress={handlePress}>
      <Icon color={'white'} />
    </TransparentButton>
  );
}
