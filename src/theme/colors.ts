/** Colour tokens from the Figma file. Screens never hard-code colours: they import these. */
export const colors = {
  midnight: '#0E0940',
  purple: '#5631E8',
  daylight: '#EDF6FF',
  silver: '#DBDAE6',
  cardImage: '#F6F6FF',
  white: '#FFFFFF',
  /** Type badge background (Midnight at 8%). */
  chip: 'rgba(14, 9, 64, 0.08)',
  /** Softer Midnight for secondary text. */
  midnightMuted: 'rgba(14, 9, 64, 0.65)',
  /** Placeholder text (Midnight at 30%). */
  midnightFaint: 'rgba(14, 9, 64, 0.3)',
  /** Ring behind the loading spinner (Purple at 20%). */
  purpleSoft: 'rgba(86, 49, 232, 0.2)',
} as const;
