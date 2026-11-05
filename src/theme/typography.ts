import type { TextStyle } from 'react-native';

import { colors } from './colors';

/**
 * Rubik faces, one fontFamily name per weight (see src/hooks/use-app-fonts.ts).
 * Rubik replaces Cabinet Grotesk (titles) and Inter (search field) from Figma.
 */
export const fonts = {
  regular: 'Rubik-Regular',
  medium: 'Rubik-Medium',
  semiBold: 'Rubik-SemiBold',
  bold: 'Rubik-Bold',
} as const;

export const text = {
  /** Detail name: Figma 32, Cabinet Grotesk ExtraBold. */
  display: { fontFamily: fonts.bold, fontSize: 32, lineHeight: 38, color: colors.midnight },
  /** "All Pokémon", "My favorites": Figma 24, Cabinet Grotesk ExtraBold. */
  title: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 29, color: colors.midnight },
  /** Error and empty state titles. */
  heading: { fontFamily: fonts.semiBold, fontSize: 18, lineHeight: 23, color: colors.midnight },
  /** Card name. */
  cardName: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 19, color: colors.midnight },
  /** Type badge, buttons. */
  label: { fontFamily: fonts.semiBold, fontSize: 16, lineHeight: 24, color: colors.midnight },
  /** Tabs, About labels. */
  labelSmall: { fontFamily: fonts.semiBold, fontSize: 14, lineHeight: 17, color: colors.midnight },
  body: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 18, color: colors.midnightMuted },
  /** Search field: Figma 16, Inter Regular. */
  input: { fontFamily: fonts.regular, fontSize: 16, color: colors.midnight },
  /** Card number label ("001"). */
  badge: { fontFamily: fonts.medium, fontSize: 10, color: colors.white },
} satisfies Record<string, TextStyle>;
