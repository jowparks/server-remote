import { ChevronLeft } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import React, { memo } from 'react';
import TransparentButton from '../general/transparent-button';

const HeaderBack = memo((props) => {
  const router = useRouter();

  return (
    <TransparentButton onPress={() => router.back()}>
      <ChevronLeft color={'white'} {...props} />
    </TransparentButton>
  );
});

export default HeaderBack;
