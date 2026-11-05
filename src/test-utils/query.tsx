import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import type { PokemonPage } from '@/services/pokeapi-types';

/** A QueryClient for tests: no retries, so errors show at once. */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
}

export function createWrapper(client: QueryClient = createTestQueryClient()) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

/** A fake list page, as fetchPokemonPage returns it, for a list of `total` Pokémon. */
export function makePage(offset: number, total: number, size = 20): PokemonPage {
  const end = Math.min(offset + size, total);
  const items = [];
  for (let id = offset + 1; id <= end; id += 1) {
    items.push({ id, name: `pokemon-${id}`, spriteUrl: `https://sprites.test/${id}.png` });
  }
  return { count: total, items, nextOffset: end < total ? end : null };
}
