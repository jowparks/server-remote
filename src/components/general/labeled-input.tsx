import React, { useState } from 'react';
import { View } from 'react-native';
import { Input, InputProps, Text } from 'tamagui';
import { DarkBlueTheme } from '../../style/theme';

type LabeledInputProps = InputProps & {
  label: string;
};
export default function LabeledInput({ label, ...props }: LabeledInputProps) {
  const { placeholder: initial } = props;
  const [placeholder, setPlaceholder] = useState(initial);

  return (
    <View style={{ width: '90%' }}>
      <Input
        {...props}
        placeholder={placeholder}
        placeholderTextColor={DarkBlueTheme.borderLight}
        onFocus={() => setPlaceholder('')}
        onBlur={() => setPlaceholder(initial)}
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
          color: DarkBlueTheme.colors.notification, // Adjust the color of the label
        }}
      >
        {label}
      </Text>
    </View>
  );
}
