import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { useAppFonts } from '@/hooks/use-app-fonts';
import { createQueryClient } from '@/services/query-client';
import { colors, fonts } from '@/theme';

SplashScreen.preventAutoHideAsync();

const queryClient = createQueryClient();

/** Root: providers, fonts behind the splash screen, and a stack with the tabs and the detail on top. */
export default function RootLayout() {
  const fontsReady = useAppFonts();

  useEffect(() => {
    if (fontsReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsReady]);

  if (!fontsReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: colors.daylight },
          headerStyle: { backgroundColor: colors.daylight },
          headerTintColor: colors.midnight,
          headerTitleStyle: { fontFamily: fonts.semiBold },
          headerShadowVisible: false,
          // iOS labels the back button with the previous title; the (tabs) group has none (Figma: "Back").
          headerBackTitle: 'Back',
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="pokemon/[id]" options={{ title: '' }} />
        <Stack.Screen name="compare" options={{ title: 'Compare' }} />
      </Stack>
    </QueryClientProvider>
  );
}
