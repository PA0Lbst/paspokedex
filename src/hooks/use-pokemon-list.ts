import { type InfiniteData, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

import { fetchPokemonPage } from '@/services/pokeapi';
import type { PokemonPage, PokemonSummary } from '@/services/pokeapi-types';
import { queryKeys } from '@/services/query-client';

export type PokemonList = {
  pokemon: PokemonSummary[];
  /** Total in the API (1351), or null before the first page. */
  total: number | null;
  /** First page loading. */
  isLoading: boolean;
  /** First page failed: nothing to show. */
  isError: boolean;
  error: unknown;
  retry: () => void;
  /** Ask for the next page. Safe to call often: it does nothing while loading, after a failure or at the end. */
  loadMore: () => void;
  isLoadingMore: boolean;
  /** A later page failed; the cards already loaded stay. */
  loadMoreFailed: boolean;
  retryLoadMore: () => void;
  hasMore: boolean;
  /** Pull to refresh: reloads from page 1, keeping the cards on screen meanwhile. */
  refresh: () => Promise<void>;
};

/** All Pokémon, 20 per page, for the grid on the Pokémons tab. */
export function usePokemonList(): PokemonList {
  const queryClient = useQueryClient();
  const query = useInfiniteQuery({
    queryKey: queryKeys.pokemonList,
    queryFn: ({ pageParam }) => fetchPokemonPage(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
  });

  const pages = query.data?.pages ?? [];
  const pokemon = pages.flatMap((page) => page.items);
  const canLoadMore = query.hasNextPage && !query.isFetchingNextPage && !query.isFetchNextPageError;

  return {
    pokemon,
    total: pages[0]?.count ?? null,
    isLoading: query.isPending,
    isError: query.isError && pages.length === 0,
    error: query.error,
    retry: () => {
      query.refetch();
    },
    loadMore: () => {
      // cancelRefetch: false → a second call while a page loads is ignored instead of restarting it.
      if (canLoadMore) query.fetchNextPage({ cancelRefetch: false });
    },
    isLoadingMore: query.isFetchingNextPage,
    loadMoreFailed: query.isFetchNextPageError,
    retryLoadMore: () => {
      query.fetchNextPage({ cancelRefetch: false });
    },
    hasMore: query.hasNextPage,
    refresh: async () => {
      // Keep only the first page, so the refetch reloads page 1 instead of every loaded page.
      queryClient.setQueryData<InfiniteData<PokemonPage, number>>(queryKeys.pokemonList, (data) =>
        data ? { pages: data.pages.slice(0, 1), pageParams: data.pageParams.slice(0, 1) } : data,
      );
      await query.refetch();
    },
  };
}
