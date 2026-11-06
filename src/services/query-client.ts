import { QueryClient } from '@tanstack/react-query';

import { ApiError } from './api-error';

/** Don't retry what can't get better (404, broken response). */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && (error.status === 404 || error.kind === 'invalid')) return false;
  return failureCount < 2;
}

/** The app's only QueryClient. PokeAPI data barely changes, so it stays fresh for a day. */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: shouldRetry,
        staleTime: 24 * 60 * 60 * 1000,
      },
    },
  });
}

/** All query keys in one place, so screens share the same cache entries. */
export const queryKeys = {
  pokemonList: ['pokemon', 'list'] as const,
  pokemonIndex: ['pokemon', 'index'] as const,
  pokemon: (id: number) => ['pokemon', id] as const,
  species: (id: number) => ['species', id] as const,
  evolutionChain: (id: number) => ['evolution-chain', id] as const,
};
