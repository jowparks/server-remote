import { X } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Button, Text } from 'tamagui';

export default function root() {
  const router = useRouter();
  return (
    <Button unstyled onPress={() => router.navigate('/')}>
      <X color={'white'} />
    </Button>
  );
}
