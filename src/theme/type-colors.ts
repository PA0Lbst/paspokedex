/**
 * Colour of each Pokémon type, shown as the dot in a type badge.
 * Grass, poison, fire and electric come from Figma; the others are our own choice
 * (see docs/product.md → "Type colours").
 */
export const typeColors = {
  normal: '#A8A77A',
  fire: '#FF4F68',
  water: '#6390F0',
  electric: '#FFCF00',
  grass: '#64BC55',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#AB6AC8',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
} as const;

export type PokemonType = keyof typeof typeColors;

/** Used for types the API may add later (or "unknown"/"stellar"). */
export const fallbackTypeColor = '#DBDAE6';

export function isPokemonType(name: string): name is PokemonType {
  return Object.hasOwn(typeColors, name);
}

/** Colour for a type name from the API ("grass", "Fire"...). Unknown types get the fallback. */
export function getTypeColor(name: string): string {
  const key = name.toLowerCase();
  return isPokemonType(key) ? typeColors[key] : fallbackTypeColor;
}
