import { act, renderHook } from '@testing-library/react-native';

import { useDebouncedValue } from '../use-debounced-value';

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe('useDebouncedValue', () => {
  it('updates only after the value stops changing for the delay', async () => {
    const { result, rerender } = await renderHook(({ value }: { value: string }) => useDebouncedValue(value, 200), {
      initialProps: { value: '' },
    });

    await rerender({ value: 'p' });
    await act(async () => jest.advanceTimersByTime(150));
    await rerender({ value: 'pi' });
    await act(async () => jest.advanceTimersByTime(150));
    expect(result.current).toBe('');

    await act(async () => jest.advanceTimersByTime(50));
    expect(result.current).toBe('pi');
  });
});
