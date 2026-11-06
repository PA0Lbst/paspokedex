import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { type Colors, darkColors, lightColors } from './colors';
import { makeText, type TextStyles } from './typography';

export type Theme = { dark: boolean; colors: Colors; text: TextStyles };

const lightTheme: Theme = { dark: false, colors: lightColors, text: makeText(lightColors) };
const darkTheme: Theme = { dark: true, colors: darkColors, text: makeText(darkColors) };

/** Pure: the theme for a colour scheme. */
export function themeFor(scheme: string | null | undefined): Theme {
  return scheme === 'dark' ? darkTheme : lightTheme;
}

/** The theme of the phone's appearance (light or dark, #10). Re-renders when it changes. */
export function useTheme(): Theme {
  return themeFor(useColorScheme());
}

/** Styles that depend on the theme: `const useStyles = makeStyles(({ colors }) => StyleSheet.create({...}))`. */
export function makeStyles<T>(factory: (theme: Theme) => T): () => T {
  return function useStyles() {
    const theme = useTheme();
    return useMemo(() => factory(theme), [theme]);
  };
}
