import { useState } from 'react';

import type { PokemonSummary } from '@/services/pokeapi-types';
import { isSearchQuery, searchPokemon } from '@/utils/search';

import { useDebouncedValue } from './use-debounced-value';
import { usePokemonIndex } from './use-pokemon-index';

export const SEARCH_DEBOUNCE_MS = 200;

export type PokemonSearch = {
  /** What the field shows. */
  query: string;
  setQuery: (query: string) => void;
  clear: () => void;
  /** A query is applied: show results instead of the list. */
  isSearching: boolean;
  /** The applied query, trimmed (for "No Pokémon found for …"). */
  searchedText: string;
  /** Matches in number order. */
  results: PokemonSummary[];
  /** The index is downloading for the first time. */
  isLoading: boolean;
  /** No index and the download failed. */
  isError: boolean;
  error: unknown;
  retry: () => void;
  /** Downloads the index again (pull to refresh). */
  refresh: () => Promise<void>;
};

/** Search over the whole index, 200 ms after the last keystroke (specs/features/search.md). */
export function usePokemonSearch(): PokemonSearch {
  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const index = usePokemonIndex();

  // Clearing the field shows the list at once; only typing waits for the debounce.
  const applied = isSearchQuery(query) ? debounced : '';
  const isSearching = isSearchQuery(applied);

  return {
    query,
    setQuery,
    clear: () => setQuery(''),
    isSearching,
    searchedText: applied.trim(),
    results: isSearching ? searchPokemon(index.items, applied) : [],
    isLoading: index.isLoading,
    isError: index.isError,
    error: index.error,
    retry: index.retry,
    refresh: index.refresh,
  };
}
