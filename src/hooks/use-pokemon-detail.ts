import { useQuery } from '@tanstack/react-query';

import { fetchEvolutionChain, fetchPokemon, fetchSpecies } from '@/services/pokeapi';
import { queryKeys } from '@/services/query-client';
import { flattenEvolution } from '@/utils/pokemon-detail';

/**
 * Everything the detail screen shows. The Pokémon loads first; species and the
 * evolution chain follow, with their own loading and error state (Evolution tab).
 */
export function usePokemonDetail(id: number) {
  const pokemon = useQuery({ queryKey: queryKeys.pokemon(id), queryFn: () => fetchPokemon(id), enabled: id > 0 });
  const speciesId = pokemon.data?.speciesId;
  const species = useQuery({
    queryKey: queryKeys.species(speciesId ?? 0),
    queryFn: () => fetchSpecies(speciesId ?? 0),
    enabled: speciesId !== undefined,
  });
  const chainId = species.data?.evolutionChainId;
  const chain = useQuery({
    queryKey: queryKeys.evolutionChain(chainId ?? 0),
    queryFn: () => fetchEvolutionChain(chainId ?? 0),
    enabled: chainId !== undefined,
  });

  return {
    pokemon: pokemon.data,
    isLoading: pokemon.isPending,
    // Offline: a failed refresh keeps the saved detail on screen.
    isError: pokemon.isError && !pokemon.data,
    error: pokemon.error,
    retry: () => {
      pokemon.refetch();
    },
    evolution: {
      rows: chain.data ? flattenEvolution(chain.data) : [],
      isLoading: species.isPending || chain.isPending,
      isError: (species.isError && !species.data) || (chain.isError && !chain.data),
      error: species.error ?? chain.error,
      retry: () => {
        if (species.isError) species.refetch();
        else chain.refetch();
      },
    },
  };
}
