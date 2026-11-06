import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { addFavorite, listFavorites, removeFavorite } from '@/services/favorites-store';
import { spriteUrl } from '@/services/pokeapi';
import type { PokemonSummary } from '@/services/pokeapi-types';
import { queryKeys } from '@/services/query-client';

export type Favorites = {
  favorites: PokemonSummary[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  retry: () => void;
  isFavorite: (id: number) => boolean;
  /** Adds the Pokémon if it isn't a favorite yet, removes it otherwise. */
  toggleFavorite: (pokemon: { id: number; name: string }) => Promise<void>;
  /** The last save failed and was rolled back. */
  saveFailed: boolean;
};

type Change = { pokemon: { id: number; name: string }; add: boolean };

/** The favorites list after a change, newest first (same order as the store). */
export function applyFavoriteChange(list: PokemonSummary[], { pokemon, add }: Change): PokemonSummary[] {
  const without = list.filter((favorite) => favorite.id !== pokemon.id);
  return add ? [{ id: pokemon.id, name: pokemon.name, spriteUrl: spriteUrl(pokemon.id) }, ...without] : without;
}

/**
 * Favorites stored in SQLite, shared by the Favorites tab, the detail and the Options sheet.
 * Optimistic (#20): a change shows at once, before SQLite is done, and goes back if it fails.
 */
export function useFavorites(): Favorites {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: queryKeys.favorites, queryFn: listFavorites, staleTime: Infinity });
  const favorites = query.data ?? [];

  const mutation = useMutation({
    mutationFn: ({ pokemon, add }: Change) => (add ? addFavorite(pokemon) : removeFavorite(pokemon.id)),
    onMutate: async (change: Change) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.favorites });
      const previous = queryClient.getQueryData<PokemonSummary[]>(queryKeys.favorites) ?? [];
      queryClient.setQueryData(queryKeys.favorites, applyFavoriteChange(previous, change));
      return { previous };
    },
    onError: (_error, _change, context) => {
      if (context) queryClient.setQueryData(queryKeys.favorites, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.favorites }),
  });

  const isFavorite = (id: number) => favorites.some((favorite) => favorite.id === id);

  return {
    favorites,
    isLoading: query.isPending,
    isError: query.isError && !query.data,
    error: query.error,
    retry: () => {
      query.refetch();
    },
    isFavorite,
    toggleFavorite: async (pokemon) => {
      try {
        await mutation.mutateAsync({ pokemon, add: !isFavorite(pokemon.id) });
      } catch {
        // Rolled back in onError; `saveFailed` tells the screen.
      }
    },
    saveFailed: mutation.isError,
  };
}
