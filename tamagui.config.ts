import { createTamagui } from 'tamagui';
import { config as tamaguiConfig, themes } from '@tamagui/config/v3';
import { createThemeBuilder } from '@tamagui/theme-builder';

const config = createTamagui({
  ...tamaguiConfig,
  themes: themes,
});

export type AppConfig = typeof config;

declare module 'tamagui' {
  // overrides TamaguiCustomConfig so your custom types
  // work everywhere you import `tamagui`
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
