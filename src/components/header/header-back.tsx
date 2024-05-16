import { ChevronLeft } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Button } from 'tamagui';
import TransparentButton from '../general/transparent-button';

export default function HeaderBack(props) {
  const router = useRouter();

  return (
    <TransparentButton onPress={() => router.back()}>
      <ChevronLeft color={'white'} {...props} />
    </TransparentButton>
  );
}
