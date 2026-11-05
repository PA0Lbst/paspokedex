import type { ViewStyle } from 'react-native';

/** Spacing scale from Figma (4-point grid). */
export const spacing = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  card: 8,
  sheet: 16,
  pill: 99,
} as const;

/** Figma "Soft shadow": 0 2 15 #30377326. */
export const softShadow: ViewStyle = {
  boxShadow: '0px 2px 15px rgba(48, 55, 115, 0.15)',
};
