import { SplashScreen } from 'expo-router';
import { TamaguiProvider, Text, XStack } from 'tamagui';

import '../../tamagui-web.css';

import config from '../../tamagui.config';
import { useFonts } from 'expo-font';
import { ToastProvider, ToastViewport } from '@tamagui/toast';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SshProvider } from '../contexts/ssh';
import React, { useEffect } from 'react';
import { DockerProvider } from '../contexts/docker';
import { VmProvider } from '../contexts/vm';
import { FilesProvider } from '../contexts/files';
import { ThemeProvider } from '@react-navigation/native';
import { DarkBlueTheme } from '../style/theme';
import Drawer from 'expo-router/drawer';
import DrawerButton from '../components/header/drawer-button';
import { Server, Settings, Wand2 } from '@tamagui/lucide-icons';
import { HeaderProvider } from '../contexts/header';
import { BiometricsProvider } from '../contexts/biometrics';
import { AuthenticationProvider } from '../contexts/authentication';
import { Appearance } from 'react-native';
import Login from '../components/overlays/login';
import { AirtableProvider } from '../contexts/airtable';
import UpdateRequired from '../components/overlays/update-required';
import { TransferProvider } from '../contexts/transfers';
import { GenericScreenProvider } from '../contexts/generic';

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

Appearance.setColorScheme('dark');
function RootLayoutNav() {
  // const colorScheme = useColorScheme();
  const { left, top, right } = useSafeAreaInsets();
  return (
    <TamaguiProvider config={config} defaultTheme="dark_blue">
      {/* <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}> */}
      {/* <ThemeProvider value={DarkTheme}> */}
      <ThemeProvider value={DarkBlueTheme}>
        <BiometricsProvider>
          <HeaderProvider>
            <SshProvider>
              <VmProvider>
                <TransferProvider>
                  <DockerProvider>
                    <AirtableProvider>
                      <FilesProvider>
                        <GenericScreenProvider>
                          <ToastProvider>
                            <ToastViewport
                              flexDirection="column-reverse"
                              top={top}
                              left={left}
                              right={right}
                            />
                            <AuthenticationProvider>
                              <Login />
                              <UpdateRequired />
                              <Drawer
                                screenOptions={{
                                  drawerActiveBackgroundColor:
                                    DarkBlueTheme.colors.background,
                                  drawerInactiveBackgroundColor:
                                    DarkBlueTheme.colors.background,
                                  drawerContentStyle: {
                                    backgroundColor:
                                      DarkBlueTheme.colors.background,
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
                                      backgroundColor:
                                        DarkBlueTheme.colors.background,
                                    },
                                  }}
                                />
                                <Drawer.Screen
                                  name="feature-request"
                                  options={{
                                    title: 'Request a feature',
                                    headerShown: false,
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
                                      backgroundColor:
                                        DarkBlueTheme.colors.background,
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
                            </AuthenticationProvider>
                          </ToastProvider>
                        </GenericScreenProvider>
                      </FilesProvider>
                    </AirtableProvider>
                  </DockerProvider>
                </TransferProvider>
              </VmProvider>
            </SshProvider>
          </HeaderProvider>
        </BiometricsProvider>
      </ThemeProvider>
    </TamaguiProvider>
  );
}
