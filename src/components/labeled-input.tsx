import React from 'react';
import { View } from 'react-native';
import { Input, InputProps, Text } from 'tamagui';

type LabeledInputProps = InputProps & {
  label: string;
};
export default function LabeledInput({ label, ...props }: LabeledInputProps) {
  return (
    <View style={{ width: '90%' }}>
      <Input
        {...props}
        style={{
          paddingLeft: 80, // Adjust the padding to make space for the label
          textAlign: 'right', // Align the input text to the right
        }}
      />
      <Text
        style={{
          position: 'absolute',
          left: 10, // Adjust the left position of the label
          top: '50%',
          transform: [{ translateY: -10 }], // Adjust the vertical centering of the label
          fontSize: 16, // Adjust the font size of the label
          color: '#888', // Adjust the color of the label
        }}
      >
        {label}
      </Text>
    </View>
  );
}
