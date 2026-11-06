import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import type { PokemonSummary } from '@/services/pokeapi-types';
import { downloadPokemonIndex, loadPokemonIndex } from '@/services/pokemon-index';
import { queryKeys } from '@/services/query-client';

export type PokemonIndexState = {
  /** Every Pokémon, sorted by id. Empty until the index is there. */
  items: PokemonSummary[];
  /** No index yet: first download running. */
  isLoading: boolean;
  /** No index at all: nothing stored and the download failed. */
  isError: boolean;
  error: unknown;
  retry: () => void;
  /** Downloads the index again (pull to refresh). Keeps the current one if it fails. */
  refresh: () => Promise<void>;
};

/**
 * The search index: stored copy from SQLite, or a download on first launch.
 * A copy older than 7 days shows at once and is replaced in the background
 * when a new download works (docs/features/search.md).
 */
export function usePokemonIndex(): PokemonIndexState {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.pokemonIndex,
    queryFn: () => loadPokemonIndex(),
    // Freshness is handled by loadPokemonIndex (7 days) and the refresh below, not by TanStack.
    staleTime: Infinity,
  });

  const isStale = query.data?.isStale ?? false;
  const backgroundRefreshStarted = useRef(false);

  useEffect(() => {
    if (!isStale || backgroundRefreshStarted.current) return;
    backgroundRefreshStarted.current = true;
    downloadPokemonIndex()
      .then((fresh) => queryClient.setQueryData(queryKeys.pokemonIndex, fresh))
      .catch(() => {
        // Offline: keep the old copy. It is still stale, so the next launch tries again.
      });
  }, [isStale, queryClient]);

  return {
    items: query.data?.items ?? [],
    isLoading: query.isPending,
    isError: query.isError && !query.data,
    error: query.error,
    retry: () => {
      query.refetch();
    },
    refresh: async () => {
      try {
        queryClient.setQueryData(queryKeys.pokemonIndex, await downloadPokemonIndex());
      } catch {
        // Keep what we have; the error state shows only when there is nothing at all.
      }
    },
  };
}
