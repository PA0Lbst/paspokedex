import { act, renderHook } from '@testing-library/react-native';

import { useTwoPressReset } from '../use-two-press-reset';

const scrollToTop = jest.fn();
const clearSearch = jest.fn();

async function renderReset(query: string) {
  return renderHook(({ q }: { q: string }) => useTwoPressReset({ query: q, scrollToTop, clearSearch }), {
    initialProps: { q: query },
  });
}

beforeEach(() => {
  scrollToTop.mockReset();
  clearSearch.mockReset();
});

describe('useTwoPressReset', () => {
  it('only scrolls to the top when there is no search', async () => {
    const { result } = await renderReset('');

    await act(async () => result.current.onRePress());
    await act(async () => result.current.onRePress());

    expect(scrollToTop).toHaveBeenCalledTimes(2);
    expect(clearSearch).not.toHaveBeenCalled();
  });

  it('keeps the search on the first press and clears it on the second', async () => {
    const { result } = await renderReset('pika');

    await act(async () => result.current.onRePress());
    expect(scrollToTop).toHaveBeenCalledTimes(1);
    expect(clearSearch).not.toHaveBeenCalled();

    await act(async () => result.current.onRePress());
    expect(clearSearch).toHaveBeenCalledTimes(1);
    expect(scrollToTop).toHaveBeenCalledTimes(1);
  });

  it('starts over when the user types between the presses', async () => {
    const { result, rerender } = await renderReset('pika');

    await act(async () => result.current.onRePress());
    await rerender({ q: 'pikac' });
    await act(async () => result.current.onRePress());

    expect(scrollToTop).toHaveBeenCalledTimes(2);
    expect(clearSearch).not.toHaveBeenCalled();
  });

  it('starts over when the user scrolls the results between the presses', async () => {
    const { result } = await renderReset('pika');

    await act(async () => result.current.onRePress());
    await act(async () => result.current.cancel());
    await act(async () => result.current.onRePress());

    expect(scrollToTop).toHaveBeenCalledTimes(2);
    expect(clearSearch).not.toHaveBeenCalled();
  });

  it('needs two presses again for the next search', async () => {
    const { result, rerender } = await renderReset('pika');
    await act(async () => result.current.onRePress());
    await act(async () => result.current.onRePress());
    await rerender({ q: '' });
    await rerender({ q: 'char' });

    await act(async () => result.current.onRePress());

    expect(clearSearch).toHaveBeenCalledTimes(1);
    expect(scrollToTop).toHaveBeenCalledTimes(2);
  });
});
