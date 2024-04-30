import { ChevronLeft } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Button } from 'tamagui';

export default function HeaderBack(props) {
  const router = useRouter();

  return (
    <Button onPress={() => router.back()} unstyled>
      <ChevronLeft color={'white'} {...props} />
    </Button>
  );
}
