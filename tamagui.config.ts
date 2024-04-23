import { createTamagui } from 'tamagui';
import { AnimationDriver } from '@tamagui/web';
import { createAnimations } from '@tamagui/animations-react-native';

import { config as tamaguiConfig, themes } from '@tamagui/config/v3';

const config = createTamagui({
  ...tamaguiConfig,
  themes: themes,
  animations: createAnimations({
    fast: {
      damping: 20,
      mass: 1.2,
      stiffness: 250,
      delay: 0,
    },
    medium: {
      damping: 10,
      mass: 0.9,
      stiffness: 100,
      delay: 0,
    },
    slow: {
      damping: 20,
      stiffness: 60,
      delay: 0,
    },
  }) as AnimationDriver<any>,
});

export type AppConfig = typeof config;

declare module 'tamagui' {
  // overrides TamaguiCustomConfig so your custom types
  // work everywhere you import `tamagui`
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
