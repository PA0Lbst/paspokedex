/**
 * Colour tokens. Light is the Figma palette; dark (#10) keeps the same roles with a deep
 * Midnight background. Screens never hard-code colours: they get them from `useTheme()`.
 */
export const lightColors = {
  /** Main text (Figma Midnight). */
  midnight: '#0E0940',
  /** Accent (Figma Purple). */
  purple: '#5631E8',
  /** Screen background (Figma Daylight). */
  daylight: '#EDF6FF',
  /** Lines and tracks (Figma Silver). */
  silver: '#DBDAE6',
  /** Behind sprites on cards. */
  cardImage: '#F6F6FF',
  /** Cards, panels, fields (white in Figma). */
  white: '#FFFFFF',
  /** Text and icons on a Purple background. */
  onAccent: '#FFFFFF',
  /** Type badge background (Midnight at 8%). */
  chip: 'rgba(14, 9, 64, 0.08)',
  /** Softer Midnight for secondary text. */
  midnightMuted: 'rgba(14, 9, 64, 0.65)',
  /** Placeholder text (Midnight at 30%). */
  midnightFaint: 'rgba(14, 9, 64, 0.3)',
  /** Ring behind the loading spinner (Purple at 20%). */
  purpleSoft: 'rgba(86, 49, 232, 0.2)',
  /** Figma Options sheet: system blue actions, grey group, separators, Cancel button. */
  actionBlue: '#006DF8',
  sheetGroup: '#F0F0F0',
  sheetSeparator: '#DADADA',
  sheetCancel: '#FEFEFE',
  sheetText: '#000000',
};

export type Colors = typeof lightColors;

export const darkColors: Colors = {
  midnight: '#EDF6FF',
  purple: '#8C72FF',
  daylight: '#0B0826',
  silver: '#363158',
  cardImage: '#221D4A',
  white: '#17123A',
  onAccent: '#FFFFFF',
  chip: 'rgba(237, 246, 255, 0.12)',
  midnightMuted: 'rgba(237, 246, 255, 0.7)',
  midnightFaint: 'rgba(237, 246, 255, 0.4)',
  purpleSoft: 'rgba(140, 114, 255, 0.25)',
  actionBlue: '#4C9BFF',
  sheetGroup: '#221D4A',
  sheetSeparator: '#363158',
  sheetCancel: '#17123A',
  sheetText: '#EDF6FF',
};
