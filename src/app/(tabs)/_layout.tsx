import { NativeTabs } from 'expo-router/native-tabs';

import { fonts, useTheme } from '@/theme';
import { t } from '@/i18n';

/** Bottom tab bar from Figma: Pokémons and Favorites, Midnight by default and Purple when selected. */
export default function TabsLayout() {
  const { colors } = useTheme();
  return (
    <NativeTabs
      backgroundColor={colors.daylight}
      iconColor={{ default: colors.midnight, selected: colors.purple }}
      labelStyle={{
        default: { fontFamily: fonts.medium, fontSize: 10, color: colors.midnight },
        selected: { fontFamily: fonts.bold, fontSize: 10, color: colors.purple },
      }}>
      {/* Pressing the active tab is handled by the screen (useTabRePress), not the native scroll-to-top. */}
      <NativeTabs.Trigger name="index" disableScrollToTop>
        <NativeTabs.Trigger.Label>{t('tabPokemon')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={require('@/assets/icons/tab-pokemon.png')} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="favorites" disableScrollToTop>
        <NativeTabs.Trigger.Label>{t('tabFavorites')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={require('@/assets/icons/favorite.png')} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
