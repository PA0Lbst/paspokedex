import { renderHook } from '@testing-library/react-native';
import { useFonts } from 'expo-font';

import { appFontMap, useAppFonts } from '../use-app-fonts';

jest.mock('expo-font', () => ({ useFonts: jest.fn() }));

const mockedUseFonts = jest.mocked(useFonts);

describe('useAppFonts', () => {
  it('loads the four Rubik faces the theme uses', async () => {
    mockedUseFonts.mockReturnValue([false, null]);
    await renderHook(() => useAppFonts());
    expect(mockedUseFonts).toHaveBeenCalledWith(appFontMap);
    expect(Object.keys(appFontMap)).toEqual(['Rubik-Regular', 'Rubik-Medium', 'Rubik-SemiBold', 'Rubik-Bold']);
  });

  it('is not ready while the fonts load', async () => {
    mockedUseFonts.mockReturnValue([false, null]);
    const { result } = await renderHook(() => useAppFonts());
    expect(result.current).toBe(false);
  });

  it('is ready once loaded', async () => {
    mockedUseFonts.mockReturnValue([true, null]);
    const { result } = await renderHook(() => useAppFonts());
    expect(result.current).toBe(true);
  });

  it('does not block the app if loading fails', async () => {
    mockedUseFonts.mockReturnValue([false, new Error('font missing')]);
    const { result } = await renderHook(() => useAppFonts());
    expect(result.current).toBe(true);
  });
});
