import React from 'react';
import { Button, ButtonProps } from 'tamagui';

export default function TransparentButton({ children, ...props }: ButtonProps) {
  return (
    <Button
      transparent
      style={{
        backgroundColor: undefined,
        color: undefined,
        borderWidth: 0,
      }}
      {...props}
    >
      {children}
    </Button>
  );
}
