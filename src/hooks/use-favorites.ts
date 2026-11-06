import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { addFavorite, listFavorites, removeFavorite } from '@/services/favorites-store';
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
};

/** Favorites stored in SQLite, shared by the Favorites tab, the detail and the Options sheet. */
export function useFavorites(): Favorites {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: queryKeys.favorites, queryFn: listFavorites, staleTime: Infinity });
  const favorites = query.data ?? [];

  const mutation = useMutation({
    mutationFn: async (pokemon: { id: number; name: string }) => {
      const current = queryClient.getQueryData<PokemonSummary[]>(queryKeys.favorites) ?? [];
      if (current.some((favorite) => favorite.id === pokemon.id)) await removeFavorite(pokemon.id);
      else await addFavorite(pokemon);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.favorites }),
  });

  return {
    favorites,
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    retry: () => {
      query.refetch();
    },
    isFavorite: (id) => favorites.some((favorite) => favorite.id === id),
    toggleFavorite: async (pokemon) => {
      await mutation.mutateAsync(pokemon);
    },
  };
}
