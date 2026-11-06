import { render, screen } from '@testing-library/react-native';

import { ErrorView } from '@/components/state-views';

import { darkColors, lightColors } from '../colors';
import { themeFor } from '../use-theme';

let mockScheme: 'light' | 'dark' = 'light';
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({ __esModule: true, default: () => mockScheme }));

describe('dark mode', () => {
  it('gives every role a dark colour', () => {
    expect(Object.keys(darkColors).sort()).toEqual(Object.keys(lightColors).sort());
    expect(darkColors.daylight).not.toBe(lightColors.daylight);
    expect(darkColors.midnight).not.toBe(lightColors.midnight);
  });

  it('builds the text styles from the palette', () => {
    expect(themeFor('dark').text.title.color).toBe(darkColors.midnight);
    expect(themeFor('light').text.title.color).toBe(lightColors.midnight);
    expect(themeFor(null).dark).toBe(false);
  });

  it('renders a screen part with the dark palette when the phone is in dark mode', async () => {
    mockScheme = 'dark';
    await render(<ErrorView onRetry={jest.fn()} />);
    expect(screen.getByText('Something went wrong')).toHaveStyle({ color: darkColors.midnight });
  });
});
