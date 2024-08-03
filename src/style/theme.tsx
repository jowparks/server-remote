import { Theme } from '@react-navigation/native';

export const DarkBlueTheme: Theme & { borderLight: string } = {
  dark: true,
  colors: {
    primary: '#0D3A58', // Slightly less dark blue
    background: '#0B141F', // Very dark blue
    card: '#263238', // Dark Grey Blue
    text: '#FFFFFF', // White
    border: '#37474F', // Blue Grey
    notification: '#BBDEFB', // Light Blue
  },
  borderLight: '#546E7A', // Light Blue Grey
};

export const TransparentTheme: Theme = {
  dark: true,
  colors: {
    primary: '#0D3A58', // Slightly less dark blue
    background: '#020F1D', // Very dark blue
    card: '#263238', // Dark Grey Blue
    text: '#FFFFFF', // White
    border: '#37474F', // Blue Grey
    notification: '#BBDEFB', // Light Blue
  },
};
