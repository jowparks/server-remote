import { SplashScreen } from 'expo-router';
import { TamaguiProvider, Text, XStack } from 'tamagui';

import '../../tamagui-web.css';

import config from '../../tamagui.config';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import { ToastProvider, ToastViewport } from '@tamagui/toast';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SshProvider } from '../contexts/ssh';
import React from 'react';
import { DockerProvider } from '../contexts/docker';
import { VmProvider } from '../contexts/vm';
import { FilesProvider } from '../contexts/files';
import { ThemeProvider } from '@react-navigation/native';
import { DarkBlueTheme } from '../style/theme';
import Drawer from 'expo-router/drawer';
import DrawerButton from '../components/drawer-button';
import { Server, Settings, Wand2 } from '@tamagui/lucide-icons';
import { HeaderProvider } from '../contexts/header';
import { BiometricsProvider, useBiometrics } from '../contexts/biometrics';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <BiometricsProvider>
      <RootLayoutContent />
    </BiometricsProvider>
  );
}

function RootLayoutContent() {
  const [interLoaded, interError] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  });
  const { biometricsEnabled, promptBiometrics } = useBiometrics();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const authenticate = async () => {
      if (biometricsEnabled) {
        const success = await promptBiometrics();
        console.log('biometrics success:', success);
        setAuthenticated(success);
      } else {
        setAuthenticated(true);
      }
    };
    authenticate();
  }, [biometricsEnabled]);

  useEffect(() => {
    if ((interLoaded || interError) && authenticated) {
      // Hide the splash screen after the fonts have loaded (or an error was returned) and the UI is ready.
      SplashScreen.hideAsync();
    }
  }, [interLoaded, interError, authenticated]);

  if (!interLoaded && !interError) {
    return null;
  }

  if (!authenticated) {
    return null;
  }

  return <RootLayoutNav />;
}

// TODO: add root view for block on require update
function RootLayoutNav() {
  // const colorScheme = useColorScheme();
  const { left, top, right } = useSafeAreaInsets();
  return (
    <TamaguiProvider config={config} defaultTheme="dark_blue">
      {/* <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}> */}
      {/* <ThemeProvider value={DarkTheme}> */}
      <ThemeProvider value={DarkBlueTheme}>
        <HeaderProvider>
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
                          title: 'Servers',
                          headerShown: true,
                          drawerLabel: () => (
                            <>
                              <XStack
                                alignContent="center"
                                alignItems="center"
                                gap={'$2'}
                              >
                                <Server />
                                <Text>Servers</Text>
                              </XStack>
                            </>
                          ),
                          headerLeft: () => <DrawerButton />,
                          headerStyle: {
                            backgroundColor: DarkBlueTheme.colors.background,
                          },
                        }}
                      />
                      <Drawer.Screen
                        name="feature-request"
                        options={{
                          title: 'Request a feature',
                          headerShown: true,
                          drawerLabel: () => (
                            <>
                              <XStack
                                alignContent="center"
                                alignItems="center"
                                gap={'$2'}
                              >
                                <Wand2 />
                                <Text>Request a feature!</Text>
                              </XStack>
                            </>
                          ),
                          headerLeft: () => <DrawerButton />,
                          headerStyle: {
                            backgroundColor: DarkBlueTheme.colors.background,
                          },
                        }}
                      />
                      <Drawer.Screen
                        name="settings"
                        options={{
                          title: 'Settings',
                          headerShown: false,
                          drawerLabel: () => (
                            <>
                              <XStack
                                alignContent="center"
                                alignItems="center"
                                gap={'$2'}
                              >
                                <Settings />
                                <Text>Settings</Text>
                              </XStack>
                            </>
                          ),
                          drawerActiveTintColor: 'white',
                          drawerInactiveTintColor: 'grey',
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
        </HeaderProvider>
      </ThemeProvider>
    </TamaguiProvider>
  );
}
