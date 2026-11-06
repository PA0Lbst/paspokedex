import { renderHook } from '@testing-library/react-native';

import { useTabRePress } from '../use-tab-repress';

const listeners = new Set<() => void>();
let mockFocused = true;
const mockNavigation = {
  isFocused: () => mockFocused,
  addListener: (_event: 'tabPress', callback: () => void) => {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },
};
jest.mock('expo-router', () => ({ useNavigation: () => mockNavigation }));

/** What NativeTabs does when the tab is pressed. */
const pressTab = () => listeners.forEach((listener) => listener());

beforeEach(() => {
  listeners.clear();
  mockFocused = true;
});

describe('useTabRePress', () => {
  it('fires when the tab is pressed while already on it', async () => {
    const onRePress = jest.fn();
    await renderHook(() => useTabRePress(onRePress));

    pressTab();

    expect(onRePress).toHaveBeenCalledTimes(1);
  });

  it('does nothing when the press switches to this tab from another one', async () => {
    const onRePress = jest.fn();
    await renderHook(() => useTabRePress(onRePress));
    mockFocused = false;

    pressTab();

    expect(onRePress).not.toHaveBeenCalled();
  });

  it('stops listening when the screen unmounts', async () => {
    const onRePress = jest.fn();
    const { unmount } = await renderHook(() => useTabRePress(onRePress));

    await unmount();
    pressTab();

    expect(onRePress).not.toHaveBeenCalled();
    expect(listeners.size).toBe(0);
  });
});
