import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { useAppFonts } from '@/hooks/use-app-fonts';
import { createQueryClient, queryKeys } from '@/services/query-client';
import { PERSIST_MAX_AGE_MS, sqlitePersister } from '@/services/query-persister';
import { fonts, useTheme } from '@/theme';
import { t } from '@/i18n';

SplashScreen.preventAutoHideAsync();

const queryClient = createQueryClient();

/** Root: providers, fonts behind the splash screen, and a stack with the tabs and the detail on top. */
export default function RootLayout() {
  const { colors } = useTheme();
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
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: sqlitePersister,
        maxAge: PERSIST_MAX_AGE_MS,
        dehydrateOptions: {
          // Favorites and the search index already live in their own SQLite tables.
          shouldDehydrateQuery: (query) =>
            query.state.status === 'success' &&
            query.queryKey[0] !== queryKeys.favorites[0] &&
            query.queryKey[1] !== queryKeys.pokemonIndex[1],
        },
      }}>
      {/* Dark or light status bar text, following the theme (#10). */}
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: colors.daylight },
          headerStyle: { backgroundColor: colors.daylight },
          headerTintColor: colors.midnight,
          headerTitleStyle: { fontFamily: fonts.semiBold },
          headerShadowVisible: false,
          // iOS labels the back button with the previous title; the (tabs) group has none (Figma: "Back").
          headerBackTitle: t('back'),
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="pokemon/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="compare" options={{ headerShown: false }} />
        {/* Figma Options: a native bottom sheet that fits its rows. */}
        <Stack.Screen
          name="options/[id]"
          options={{
            presentation: 'formSheet',
            sheetAllowedDetents: 'fitToContents',
            sheetGrabberVisible: true,
            sheetCornerRadius: 24,
            headerShown: false,
            contentStyle: { backgroundColor: colors.daylight },
          }}
        />
      </Stack>
    </PersistQueryClientProvider>
  );
}
