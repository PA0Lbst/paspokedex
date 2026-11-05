import { QueryClientProvider } from '@tanstack/react-query';
import { NativeTabs } from 'expo-router/native-tabs';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { useAppFonts } from '@/hooks/use-app-fonts';
import { createQueryClient } from '@/services/query-client';
import { colors, fonts } from '@/theme';

SplashScreen.preventAutoHideAsync();

const queryClient = createQueryClient();

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
      <NativeTabs
        backgroundColor={colors.daylight}
        iconColor={{ default: colors.midnight, selected: colors.purple }}
        labelStyle={{
          default: { fontFamily: fonts.medium, fontSize: 10, color: colors.midnight },
          selected: { fontFamily: fonts.bold, fontSize: 10, color: colors.purple },
        }}>
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Label>Pokémons</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon src={require('@/assets/icons/tab-pokemon.png')} />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="favorites">
          <NativeTabs.Trigger.Label>Favorites</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon src={require('@/assets/icons/favorite.png')} />
        </NativeTabs.Trigger>
      </NativeTabs>
    </QueryClientProvider>
  );
}
