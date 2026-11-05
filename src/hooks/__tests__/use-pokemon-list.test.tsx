import { act, renderHook, waitFor } from '@testing-library/react-native';

import { ApiError } from '@/services/api-error';
import { fetchPokemonPage } from '@/services/pokeapi';
import { createWrapper, makePage } from '@/test-utils/query';

import { usePokemonList } from '../use-pokemon-list';

jest.mock('@/services/pokeapi', () => ({ fetchPokemonPage: jest.fn() }));

const fetchPage = jest.mocked(fetchPokemonPage);

/** Serves a list of `total` Pokémon, 20 per page. */
function serveList(total: number) {
  fetchPage.mockImplementation(async (offset) => makePage(offset, total));
}

async function renderList() {
  const hook = await renderHook(() => usePokemonList(), { wrapper: createWrapper() });
  return hook;
}

beforeEach(() => fetchPage.mockReset());

describe('usePokemonList', () => {
  it('is loading, then shows the first 20 Pokémon', async () => {
    serveList(1351);
    const { result } = await renderList();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(fetchPage).toHaveBeenCalledTimes(1);
    expect(fetchPage).toHaveBeenCalledWith(0);
    expect(result.current.pokemon).toHaveLength(20);
    expect(result.current.pokemon[0].id).toBe(1);
    expect(result.current.total).toBe(1351);
    expect(result.current.hasMore).toBe(true);
  });

  it('appends the next 20 when loadMore is called', async () => {
    serveList(1351);
    const { result } = await renderList();
    await waitFor(() => expect(result.current.pokemon).toHaveLength(20));

    await act(async () => result.current.loadMore());

    await waitFor(() => expect(result.current.pokemon).toHaveLength(40));
    expect(fetchPage).toHaveBeenLastCalledWith(20);
    expect(result.current.pokemon[20].id).toBe(21);
  });

  it('does not request the same page twice while it is loading', async () => {
    serveList(1351);
    const { result } = await renderList();
    await waitFor(() => expect(result.current.pokemon).toHaveLength(20));

    await act(async () => {
      result.current.loadMore();
      result.current.loadMore();
    });

    await waitFor(() => expect(result.current.pokemon).toHaveLength(40));
    expect(fetchPage).toHaveBeenCalledTimes(2);
  });

  it('reaches the last Pokémon and then stops asking for pages', async () => {
    serveList(45);
    const { result } = await renderList();
    await waitFor(() => expect(result.current.pokemon).toHaveLength(20));

    await act(async () => result.current.loadMore());
    await waitFor(() => expect(result.current.pokemon).toHaveLength(40));
    await act(async () => result.current.loadMore());
    await waitFor(() => expect(result.current.pokemon).toHaveLength(45));

    expect(result.current.hasMore).toBe(false);
    await act(async () => result.current.loadMore());
    expect(fetchPage).toHaveBeenCalledTimes(3);
    expect(result.current.pokemon.at(-1)?.id).toBe(45);
  });

  it('shows the error state when the first page fails, and retry loads it', async () => {
    fetchPage.mockRejectedValueOnce(new ApiError('network', 'offline'));
    const { result } = await renderList();
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.pokemon).toHaveLength(0);

    serveList(1351);
    await act(async () => result.current.retry());

    await waitFor(() => expect(result.current.pokemon).toHaveLength(20));
    expect(result.current.isError).toBe(false);
  });

  it('keeps the loaded cards when a later page fails, and retries that page', async () => {
    serveList(1351);
    const { result } = await renderList();
    await waitFor(() => expect(result.current.pokemon).toHaveLength(20));

    fetchPage.mockRejectedValueOnce(new ApiError('http', 'server', 500));
    await act(async () => result.current.loadMore());
    await waitFor(() => expect(result.current.loadMoreFailed).toBe(true));
    expect(result.current.pokemon).toHaveLength(20);
    expect(result.current.isError).toBe(false);

    // Scrolling again does not hammer the API after a failure: only Try again does.
    await act(async () => result.current.loadMore());
    expect(fetchPage).toHaveBeenCalledTimes(2);

    await act(async () => result.current.retryLoadMore());
    await waitFor(() => expect(result.current.pokemon).toHaveLength(40));
    expect(result.current.loadMoreFailed).toBe(false);
  });
});
