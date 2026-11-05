import { useFonts } from 'expo-font';

import { fonts } from '@/theme';

/**
 * The Rubik faces the app uses, one name per weight. Separate names (not one family with
 * fontWeight) work the same on iOS and Android in Expo Go.
 */
export const appFontMap = {
  [fonts.regular]: require('@/assets/fonts/Rubik-Regular.ttf'),
  [fonts.medium]: require('@/assets/fonts/Rubik-Medium.ttf'),
  [fonts.semiBold]: require('@/assets/fonts/Rubik-SemiBold.ttf'),
  [fonts.bold]: require('@/assets/fonts/Rubik-Bold.ttf'),
};

/** Loads Rubik at startup. Returns true once the fonts are ready, or if loading failed. */
export function useAppFonts(): boolean {
  const [loaded, error] = useFonts(appFontMap);
  return loaded || error !== null;
}
