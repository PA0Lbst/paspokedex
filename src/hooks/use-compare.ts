import { useQuery } from '@tanstack/react-query';

import { fetchPokemon } from '@/services/pokeapi';
import { queryKeys } from '@/services/query-client';
import { compareStats } from '@/utils/compare';

/** The two Pokémon being compared, and the comparison once both are loaded. */
export function useCompare(firstId: number | null, secondId: number | null) {
  const first = useQuery({
    queryKey: queryKeys.pokemon(firstId ?? 0),
    queryFn: () => fetchPokemon(firstId ?? 0),
    enabled: firstId !== null,
  });
  const second = useQuery({
    queryKey: queryKeys.pokemon(secondId ?? 0),
    queryFn: () => fetchPokemon(secondId ?? 0),
    enabled: secondId !== null,
  });

  return {
    first: first.data,
    second: second.data,
    isLoading: (firstId !== null && first.isPending) || (secondId !== null && second.isPending),
    isError: first.isError || second.isError,
    error: first.error ?? second.error,
    retry: () => {
      if (first.isError) first.refetch();
      if (second.isError) second.refetch();
    },
    comparison: first.data && second.data ? compareStats(first.data.stats, second.data.stats) : null,
  };
}
