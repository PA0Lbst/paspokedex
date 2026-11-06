import { act, renderHook, waitFor } from '@testing-library/react-native';

import { ApiError } from '@/services/api-error';
import type { PokemonSummary } from '@/services/pokeapi-types';
import { downloadPokemonIndex, loadPokemonIndex, type PokemonIndex } from '@/services/pokemon-index';
import { createWrapper } from '@/test-utils/query';

import { SEARCH_DEBOUNCE_MS, usePokemonSearch } from '../use-pokemon-search';

jest.mock('@/services/pokemon-index', () => ({
  loadPokemonIndex: jest.fn(),
  downloadPokemonIndex: jest.fn(),
}));

const load = jest.mocked(loadPokemonIndex);
const download = jest.mocked(downloadPokemonIndex);

const p = (id: number, name: string): PokemonSummary => ({ id, name, spriteUrl: `https://sprites.test/${id}.png` });
/** Includes Pokémon far past the first list page, as on a first launch. */
const items = [p(1, 'bulbasaur'), p(25, 'pikachu'), p(26, 'raichu'), p(718, 'zygarde-50'), p(10080, 'pikachu-rock-star')];
const index = (overrides: Partial<PokemonIndex> = {}): PokemonIndex => ({
  items,
  fetchedAt: 0,
  isStale: false,
  ...overrides,
});

async function renderSearch() {
  return renderHook(() => usePokemonSearch(), { wrapper: createWrapper() });
}

async function type(result: { current: { setQuery: (q: string) => void } }, text: string) {
  await act(async () => result.current.setQuery(text));
}

beforeEach(() => {
  load.mockReset();
  download.mockReset();
});

describe('usePokemonSearch', () => {
  it('shows matches a moment after typing: "pika" finds Pikachu', async () => {
    load.mockResolvedValue(index());
    const { result } = await renderSearch();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await type(result, 'pika');
    expect(result.current.query).toBe('pika');
    expect(result.current.isSearching).toBe(false);

    await waitFor(() => expect(result.current.isSearching).toBe(true), { timeout: SEARCH_DEBOUNCE_MS * 3 });
    expect(result.current.results.map((r) => r.id)).toEqual([25, 10080]);
    expect(result.current.searchedText).toBe('pika');
  });

  it('finds Pokémon the list has not loaded yet', async () => {
    load.mockResolvedValue(index());
    const { result } = await renderSearch();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await type(result, 'ZYGARDE');

    await waitFor(() => expect(result.current.results.map((r) => r.id)).toEqual([718]));
  });

  it('has no results for no match, so the screen shows the empty state', async () => {
    load.mockResolvedValue(index());
    const { result } = await renderSearch();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await type(result, ' xyz ');

    await waitFor(() => expect(result.current.isSearching).toBe(true));
    expect(result.current.results).toEqual([]);
    expect(result.current.searchedText).toBe('xyz');
  });

  it('goes back to the list at once when the field is cleared', async () => {
    load.mockResolvedValue(index());
    const { result } = await renderSearch();
    await type(result, 'pika');
    await waitFor(() => expect(result.current.isSearching).toBe(true));

    await act(async () => result.current.clear());

    expect(result.current.query).toBe('');
    expect(result.current.isSearching).toBe(false);
    expect(result.current.results).toEqual([]);
  });

  it('treats a blank field as no search', async () => {
    load.mockResolvedValue(index());
    const { result } = await renderSearch();
    await type(result, '   ');
    await act(async () => new Promise((resolve) => setTimeout(resolve, SEARCH_DEBOUNCE_MS + 50)));

    expect(result.current.isSearching).toBe(false);
  });

  it('is loading while the index downloads for the first time', async () => {
    load.mockReturnValue(new Promise(() => {}));
    const { result } = await renderSearch();

    expect(result.current.isLoading).toBe(true);
  });

  it('shows the error when the first download fails, and retry loads it', async () => {
    load.mockRejectedValueOnce(new ApiError('network', 'offline'));
    const { result } = await renderSearch();
    await waitFor(() => expect(result.current.isError).toBe(true));

    load.mockResolvedValue(index());
    await act(async () => result.current.retry());

    await waitFor(() => expect(result.current.isError).toBe(false));
    expect(result.current.isLoading).toBe(false);
  });

  it('refreshes a stale index in the background and keeps searching the old one meanwhile', async () => {
    load.mockResolvedValue(index({ isStale: true, items: [p(25, 'pikachu')] }));
    let finishDownload: (value: PokemonIndex) => void = () => {};
    download.mockReturnValue(new Promise((resolve) => (finishDownload = resolve)));
    const { result } = await renderSearch();

    await type(result, 'pika');
    await waitFor(() => expect(result.current.results.map((r) => r.id)).toEqual([25]));
    expect(download).toHaveBeenCalledTimes(1);

    await act(async () => finishDownload(index()));

    await waitFor(() => expect(result.current.results.map((r) => r.id)).toEqual([25, 10080]));
  });

  it('keeps the stale index when the background refresh fails', async () => {
    load.mockResolvedValue(index({ isStale: true }));
    download.mockRejectedValue(new ApiError('network', 'offline'));
    const { result } = await renderSearch();
    await waitFor(() => expect(download).toHaveBeenCalledTimes(1));

    await type(result, 'pika');

    await waitFor(() => expect(result.current.results).toHaveLength(2));
    expect(result.current.isError).toBe(false);
  });

  it('pull to refresh downloads again, and a failure keeps the current index', async () => {
    load.mockResolvedValue(index({ items: [p(25, 'pikachu')] }));
    const { result } = await renderSearch();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    download.mockRejectedValueOnce(new ApiError('network', 'offline'));
    await act(async () => result.current.refresh());
    await type(result, 'pika');
    await waitFor(() => expect(result.current.results.map((r) => r.id)).toEqual([25]));

    download.mockResolvedValueOnce(index());
    await act(async () => result.current.refresh());
    await waitFor(() => expect(result.current.results.map((r) => r.id)).toEqual([25, 10080]));
  });
});
