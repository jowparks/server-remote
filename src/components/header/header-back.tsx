import { ChevronLeft } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import React, { memo } from 'react';
import { IconProps } from '@tamagui/helpers-icon';
import TransparentButton from '../general/transparent-button';

export type HeaderBackProps = {
  onPress?: () => void;
  iconProps?: IconProps;
};

const HeaderBack = memo(({ onPress, iconProps }: HeaderBackProps) => {
  const router = useRouter();

  return (
    <TransparentButton onPress={() => (onPress ? onPress() : router.back())}>
      <ChevronLeft color={'white'} {...iconProps} />
    </TransparentButton>
  );
});

export default HeaderBack;
