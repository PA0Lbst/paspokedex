import type { PokemonSummary } from '@/services/pokeapi-types';

/**
 * Search rules (docs/features/search.md): any case, anywhere in the name, spaces,
 * dashes and apostrophes ignored, and a number finds that Pokémon.
 */

/** Lowercase letters and digits only: "Mr. Mime" → "mrmime", "farfetch'd" → "farfetchd". */
export function normalizeSearchText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** True when the field has something to search for (not blank, not only punctuation). */
export function isSearchQuery(query: string): boolean {
  return normalizeSearchText(query) !== '';
}

/** Does this Pokémon match an already normalised query? */
export function matchesQuery(pokemon: PokemonSummary, normalizedQuery: string): boolean {
  if (normalizedQuery === '') return false;
  if (/^\d+$/.test(normalizedQuery) && Number(normalizedQuery) === pokemon.id) return true;
  return normalizeSearchText(pokemon.name).includes(normalizedQuery);
}

/** Every Pokémon of the index that matches the query, in number order. Empty for a blank query. */
export function searchPokemon(index: PokemonSummary[], query: string): PokemonSummary[] {
  const normalized = normalizeSearchText(query);
  if (normalized === '') return [];
  return index.filter((pokemon) => matchesQuery(pokemon, normalized)).sort((a, b) => a.id - b.id);
}
