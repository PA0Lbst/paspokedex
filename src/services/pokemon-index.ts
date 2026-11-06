import { fetchPokemonIndex } from './pokeapi';
import type { PokemonSummary } from './pokeapi-types';
import { readStoredIndex, saveStoredIndex } from './pokemon-index-store';

/** A stored index older than this is refreshed in the background. */
export const INDEX_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export type PokemonIndex = {
  items: PokemonSummary[];
  fetchedAt: number;
  /** Older than INDEX_MAX_AGE_MS: still used, but a new download should be tried. */
  isStale: boolean;
};

/**
 * Downloads the index from PokeAPI and stores it. If storing fails, the downloaded
 * index is still returned, so search works for this session.
 */
export async function downloadPokemonIndex(now: () => number = Date.now): Promise<PokemonIndex> {
  const items = await fetchPokemonIndex();
  const fetchedAt = now();
  try {
    await saveStoredIndex(items, fetchedAt);
  } catch {
    // Storage is a cache: a failure only means the next launch downloads again.
  }
  return { items, fetchedAt, isStale: false };
}

/**
 * The index for search: the stored copy when there is one (even an old one, flagged
 * `isStale`), otherwise a fresh download. Throws only when there is no stored copy
 * and the download fails.
 */
export async function loadPokemonIndex(now: () => number = Date.now): Promise<PokemonIndex> {
  let stored = null;
  try {
    stored = await readStoredIndex();
  } catch {
    // Unreadable storage: fall back to the network.
  }
  if (stored) {
    return { ...stored, isStale: now() - stored.fetchedAt > INDEX_MAX_AGE_MS };
  }
  return downloadPokemonIndex(now);
}
