import { createTamagui } from 'tamagui';
import { createAnimations } from '@tamagui/animations-moti';
import { config as tamaguiConfig, themes } from '@tamagui/config/v3';

const config = createTamagui({
  ...tamaguiConfig,
  themes: themes,
  animations: createAnimations({
    fast: {
      type: 'spring',
      damping: 20,
      mass: 1.2,
      stiffness: 250,
    },
    medium: {
      type: 'spring',
      damping: 13,
      mass: 0.7,
      stiffness: 100,
    },
    slow: {
      type: 'spring',
      damping: 20,
      stiffness: 60,
    },
  }),
});

export type AppConfig = typeof config;

declare module 'tamagui' {
  // overrides TamaguiCustomConfig so your custom types
  // work everywhere you import `tamagui`
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
