import { ListCollapse, ListTree } from '@tamagui/lucide-icons';
import { Button } from 'tamagui';
import React from 'react';
import { useHeader } from '../contexts/header';

export default function DetailsExpandButton() {
  const { detailsExpanded, setDetailsExpanded } = useHeader();

  const handlePress = () => setDetailsExpanded(!detailsExpanded);
  const Icon = detailsExpanded ? ListCollapse : ListTree;

  return (
    <Button key={'paste'} unstyled onPress={handlePress}>
      <Icon color={'white'} />
    </Button>
  );
}
