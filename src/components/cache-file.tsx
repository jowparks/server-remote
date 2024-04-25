import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions } from 'react-native';
import { Button } from 'tamagui';
import { DarkBlueTheme } from '../style/theme';
import { ClipboardPaste } from '@tamagui/lucide-icons';

export type CacheFileOverlayProps = {
  onPress: () => void;
  open: boolean;
};

export default function CacheFileOverlay({
  open,
  onPress,
}: CacheFileOverlayProps) {
  const position = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let value = 0;
    if (!open) {
      value = Dimensions.get('window').width;
    }
    Animated.timing(position, {
      toValue: value,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [open]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: 50,
        height: 50,
        transform: [{ translateX: position }],
      }}
    >
      <Button borderColor={DarkBlueTheme.colors.border} onPress={onPress}>
        <ClipboardPaste style={{ transform: [{ scaleX: -1 }] }} />
      </Button>
    </Animated.View>
  );
}
