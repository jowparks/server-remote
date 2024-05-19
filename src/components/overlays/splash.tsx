import { StyleSheet, View } from 'react-native';
import React, { ReactNode } from 'react';

const styles = StyleSheet.create({
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#121B2C',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100000000000,
  },
});

interface SplashProps {
  children?: ReactNode;
}

export default function Splash({ children }: SplashProps) {
  return <View style={styles.fullScreen}>{children}</View>;
}
