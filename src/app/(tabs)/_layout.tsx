import { NativeTabs } from 'expo-router/native-tabs';

import { colors, fonts } from '@/theme';

/** Bottom tab bar from Figma: Pokémons and Favorites, Midnight by default and Purple when selected. */
export default function TabsLayout() {
  return (
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
  );
}
