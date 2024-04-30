import { SplashScreen, Stack } from 'expo-router';
import { TamaguiProvider } from 'tamagui';

import '../../tamagui-web.css';

import config from '../../tamagui.config';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { ToastProvider, ToastViewport } from '@tamagui/toast';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SshProvider } from '../contexts/ssh';
import React from 'react';
import { DockerProvider } from '../contexts/docker';
import { VmProvider } from '../contexts/vm';
import { FilesProvider } from '../contexts/files';
import { ThemeProvider } from '@react-navigation/native';
import { DarkBlueTheme } from '../style/theme';
import { DrawerToggleButton } from '@react-navigation/drawer';
import Drawer from 'expo-router/drawer';
import DrawerButton from '../components/drawer-button';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [interLoaded, interError] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  });

  useEffect(() => {
    if (interLoaded || interError) {
      // Hide the splash screen after the fonts have loaded (or an error was returned) and the UI is ready.
      SplashScreen.hideAsync();
    }
  }, [interLoaded, interError]);

  if (!interLoaded && !interError) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  // const colorScheme = useColorScheme();
  const { left, top, right } = useSafeAreaInsets();
  return (
    <TamaguiProvider config={config} defaultTheme="dark_blue">
      {/* <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}> */}
      {/* <ThemeProvider value={DarkTheme}> */}
      <ThemeProvider value={DarkBlueTheme}>
        <SshProvider>
          <VmProvider>
            <DockerProvider>
              <FilesProvider>
                <ToastProvider>
                  <ToastViewport
                    flexDirection="column-reverse"
                    top={top}
                    left={left}
                    right={right}
                  />
                  <Drawer
                    screenOptions={{
                      drawerActiveBackgroundColor:
                        DarkBlueTheme.colors.background,
                      drawerInactiveBackgroundColor:
                        DarkBlueTheme.colors.background,
                      drawerContentStyle: {
                        backgroundColor: DarkBlueTheme.colors.background,
                      },
                      drawerActiveTintColor: 'white',
                      drawerInactiveTintColor: 'grey',
                    }}
                  >
                    <Drawer.Screen
                      name="index"
                      options={{
                        headerShown: true,
                        title: 'Servers',
                        headerLeft: () => <DrawerButton />,
                        headerStyle: {
                          backgroundColor: DarkBlueTheme.colors.background,
                        },
                      }}
                    />
                    <Drawer.Screen
                      name="(tabs)"
                      options={{
                        drawerStatusBarAnimation: 'fade',
                        headerShown: false,
                        drawerItemStyle: { display: 'none' },
                      }}
                    />
                    <Drawer.Screen
                      name="add-server"
                      options={{
                        headerShown: false,
                        drawerItemStyle: { display: 'none' },
                      }}
                    />
                    <Drawer.Screen
                      name="+not-found"
                      options={{
                        headerShown: false,
                        drawerItemStyle: { display: 'none' },
                      }}
                    />
                  </Drawer>
                </ToastProvider>
              </FilesProvider>
            </DockerProvider>
          </VmProvider>
        </SshProvider>
      </ThemeProvider>
    </TamaguiProvider>
  );
}
