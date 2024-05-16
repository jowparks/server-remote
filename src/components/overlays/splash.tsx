import { StyleSheet, View } from 'react-native';
import { Text } from 'tamagui';
import React from 'react';

const styles = StyleSheet.create({
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100000000000,
  },
});

export type SplashProps = {
  text: string;
};

export default function Splash({ text }: SplashProps) {
  // TODO: make this splash screen nice
  return (
    <View style={styles.fullScreen}>
      <Text>{text}</Text>
    </View>
  );
}
